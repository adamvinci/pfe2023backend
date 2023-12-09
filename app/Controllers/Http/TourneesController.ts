import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Creche from 'App/Models/Creche';
import Tournee from 'App/Models/Tournee'
import CreateValidator from 'App/Validators/Tournee/CreateValidator';
import UpdateCommandValidator from 'App/Validators/Tournee/UpdateCommandValidator';



export default class TourneesController {

    // Send All the delivery with no assigned delivery man
    public async getAll({ response }: HttpContextContract) {
        const tournees = await Tournee.query().whereNull("userId").preload('user').preload('creches')
        return response.ok(tournees)
    }


    // create a tournee and assign the tournee to the nursery
    public async createOne({ request, response }: HttpContextContract) {

        const payload = await request.validate(CreateValidator);

        //verify if these nursery are not already assigned to a delivery
        const crechesWithTournee = await Creche.query().whereNotNull('tournee_id');
        const invalidCrecheIds: string[] = [];
        crechesWithTournee.forEach((creche) => {
            const foundCreche = payload.creches.find((crecheId) => crecheId === creche.$attributes.id);

            if (foundCreche) {
                invalidCrecheIds.push(creche.$attributes.nom);
            }
        });
        if (invalidCrecheIds.length > 0) {
            return response.badRequest({
                message: `The following creches are already associated with a tournee: ${invalidCrecheIds.join(', ')}`,
            });
        }

        //create tournee with delivery man
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



    // update isDelivered to true if not already true and if the delivery is assigned to this user
    public async updateDeliveryQuantity({ request, response, auth }: HttpContextContract) {
        const userId = auth.user!

        const payload = await request.validate(UpdateCommandValidator)
        const { nurseryId } = payload
        const { deliveryId } = payload;
        // Check if this delivery is assigned to this user
        const delivery = await Tournee.query()
            .where('id_tournee', deliveryId)
            .where('user_id', userId.id)
            .first()

        if (delivery == null) {
            return response.notFound({ message: 'You cannot update this delivery' });
        }

        const creche = await Creche.findOrFail(nurseryId)

        if (creche.tourneeId !== deliveryId) {
            return response.badRequest({ message: 'This nursery is not assigned to this delivery' })
        }

        if (creche.isDelivered) {
            return response.badRequest({ message: 'Tournee has already been delivered' })
        }

        //Uptade remaining quantity in delivery
        const { nombreCaisseGantLivre, nombreCaisseSacPoubelleLivre, nombreCaisseInsertLivre,
            nombreCaisseLingeLLivre, nombreCaisseLingeMLivre, nombreCaisseLingeSLivre } = payload
        const diffNombreCaisseGant = nombreCaisseGantLivre - creche.nombreCaisseGant;
        const diffNombreCaisseSacPoubelle = nombreCaisseSacPoubelleLivre - creche.nombreCaisseSacPoubelle;
        const diffNombreCaisseInsert = nombreCaisseInsertLivre - creche.nombreCaisseInsert;
        const diffNombreCaisseLingeL = nombreCaisseLingeLLivre - creche.nombreCaisseLingeL;
        const diffNombreCaisseLingeM = nombreCaisseLingeMLivre - creche.nombreCaisseLingeM;
        const diffNombreCaisseLingeS = nombreCaisseLingeSLivre - creche.nombreCaisseLingeS;

        // Update nombreCaisseRestante based on the differences
        delivery.nombreCaisseGantRestante += (diffNombreCaisseGant > 0) ? -diffNombreCaisseGant : diffNombreCaisseGant;
        delivery.nombreCaisseSacPoubelleRestante += (diffNombreCaisseSacPoubelle > 0) ? -diffNombreCaisseSacPoubelle : diffNombreCaisseSacPoubelle;
        delivery.nombreCaisseInsertRestante += (diffNombreCaisseInsert > 0) ? -diffNombreCaisseInsert : diffNombreCaisseInsert;
        delivery.nombreCaisseLingeLRestante += (diffNombreCaisseLingeL > 0) ? -diffNombreCaisseLingeL : diffNombreCaisseLingeL;
        delivery.nombreCaisseLingeMRestante += (diffNombreCaisseLingeM > 0) ? -diffNombreCaisseLingeM : diffNombreCaisseLingeM;
        delivery.nombreCaisseLingeSRestante += (diffNombreCaisseLingeS > 0) ? -diffNombreCaisseLingeS : diffNombreCaisseLingeS;


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

}



