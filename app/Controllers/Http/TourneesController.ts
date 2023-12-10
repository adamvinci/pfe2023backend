import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Creche from 'App/Models/Creche';
import Tournee from 'App/Models/Tournee'
import CreateValidator from 'App/Validators/Tournee/CreateValidator';
import UpdateCommandValidator from 'App/Validators/Tournee/UpdateCommandValidator';
import UpdateOneValidator from 'App/Validators/Tournee/UpdateOneValidator';



export default class TourneesController {

    // Send All the delivery with no assigned delivery man
    public async getAll({ response }: HttpContextContract) {
        const tournees = await Tournee.query().whereNull("userId").preload('user').preload('creches')
        return response.ok(tournees)
    }


    // create a tournee and assign the tournee to the nursery
    public async createOne({ request, response }: HttpContextContract) {

        const payload = await request.validate(CreateValidator);
        //create tournee without delivery man
        const tournee = new Tournee();
        tournee.nom = payload.nom
        await tournee.save();
        const tourneeId = tournee.$attributes.id

        //assign tourneesid to nursery
        const { creches } = payload;
        creches.forEach(async (id) => {
            const creche = await Creche.findOrFail(id);
            creche.tourneeId = tourneeId;
            await creche?.save();
        })
        const createdTournee = await Tournee.query().where('id', tourneeId).preload('user').preload('creches')
        return response.ok({ createdTournee })
    }



    // update isDelivered to true and calcul the remaining quantity in the delivery man car
    public async updateDeliveryQuantity({ request, response, auth }: HttpContextContract) {

        const userId = auth.user!

        const payload = await request.validate(UpdateCommandValidator)
        const { nurseryId } = payload
        const { deliveryId } = payload;
        // Check if this delivery is assigned to this user
        const delivery = await Tournee.query()
            .where('id', deliveryId)
            .where('user_id', userId.id)
            .first()

        if (delivery == null) {
            return response.notFound({ message: 'You cannot update this delivery' });
        }

        const creche = await Creche.findOrFail(nurseryId)

        if (creche.tourneeId !== deliveryId) {
            return response.badRequest({ message: 'This nursery is not assigned to this delivery' })
        }

        //si y'a une erreur d'encodage?
        if (creche.isDelivered) {
            return response.badRequest({ message: 'Tournee has already been delivered' })
        }


        // Update remaining quantity in delivery
        const { nombreCaisseGantLivre, nombreCaisseSacPoubelleLivre, nombreCaisseInsertLivre,
            nombreCaisseLingeLLivre, nombreCaisseLingeMLivre, nombreCaisseLingeSLivre } = payload
        const diffNombreCaisseGant = nombreCaisseGantLivre - creche.nombreCaisseGant;
        const diffNombreCaisseSacPoubelle = nombreCaisseSacPoubelleLivre - creche.nombreCaisseSacPoubelle;
        const diffNombreCaisseInsert = nombreCaisseInsertLivre - creche.nombreCaisseInsert;
        const diffNombreCaisseLingeL = nombreCaisseLingeLLivre - creche.nombreCaisseLingeL;
        const diffNombreCaisseLingeM = nombreCaisseLingeMLivre - creche.nombreCaisseLingeM;
        const diffNombreCaisseLingeS = nombreCaisseLingeSLivre - creche.nombreCaisseLingeS;

        //If one of the requests is negative
        if (diffNombreCaisseGant > delivery.nombreCaisseGantSupplementaire || diffNombreCaisseSacPoubelle > delivery.nombreCaisseSacPoubelleSupplementaire || diffNombreCaisseInsert > delivery.nombreCaisseInsertSupplementaire ||
            diffNombreCaisseLingeL > delivery.nombreCaisseLingeLSupplementaire || diffNombreCaisseLingeM > delivery.nombreCaisseLingeMSupplementaire || diffNombreCaisseLingeS > delivery.nombreCaisseLingeSSupplementaire) {
            return response.badRequest({ message: 'not enough extra quantity in stock' })
        }
        // Update nombreCaisseRestante based on the differences
        delivery.nombreCaisseGantSupplementaire += -diffNombreCaisseGant;
        delivery.nombreCaisseSacPoubelleSupplementaire += -diffNombreCaisseSacPoubelle;
        delivery.nombreCaisseInsertSupplementaire += -diffNombreCaisseInsert;
        delivery.nombreCaisseLingeLSupplementaire += -diffNombreCaisseLingeL;
        delivery.nombreCaisseLingeMSupplementaire += -diffNombreCaisseLingeM;
        delivery.nombreCaisseLingeSSupplementaire += -diffNombreCaisseLingeS;


        // Update the state and quantity
        await delivery.save();
        creche.isDelivered = true;
        await creche.save();
        return response.ok({ delivery })
    }



    public async deleteOne({ response, params }: HttpContextContract) {
        const idDelivery = params.id
        const tournee = await Tournee.find(idDelivery)
        if (tournee == null) return response.notFound();
        const creches = await Creche.query().where('tourneeId', tournee.$attributes.id);
        if (creches) {
            for (const creche of creches) {
                creche.$attributes.tourneeId = null;
                await creche.save();
            }
        }
        tournee.delete()
        return response.ok({ message: "Delivery deleted" });
    }

    public async updateOne({ response, request }: HttpContextContract) {
        const payload = await request.validate(UpdateOneValidator)
        //verify if the nursery already has a tournee associated
        if (payload.creches) {
            for (const crecheId of payload.creches) {
                const creche = await Creche.findOrFail(crecheId);
                if (creche.tourneeId !== null && creche.tourneeId !== payload.deliveryId)
                    return response.badRequest({ message: 'This nursery is already assigned to a delivery' })
            }
        }
        const tournee = await Tournee.findOrFail(payload.deliveryId);
        tournee.nom = payload.nom ?? tournee.nom;
        tournee.pourcentageSupplementaire = payload.pourcentageSupplementaire ?? tournee.pourcentageSupplementaire;
        if (payload.creches) {
            const oldCreches = await Creche.query().where("tourneeId", tournee.id)
            for (const creche of oldCreches) {
                creche.$attributes.tourneeId = null
                creche.save()
            }
            for (const crecheId of payload.creches) {
                const creche = await Creche.findOrFail(crecheId);
                creche.tourneeId = payload.deliveryId
                creche.save()
            }
        }
        await tournee.save();
        return response.ok({ message: "Delivery has been succesfully updated" })
    }

}



