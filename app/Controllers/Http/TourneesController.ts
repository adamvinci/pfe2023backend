import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Creche from 'App/Models/Creche';
import Tournee from 'App/Models/Tournee'
import CreateValidator from 'App/Validators/Tournee/CreateValidator';
import UpdateCommandValidator from 'App/Validators/Tournee/UpdateCommandValidator';
import UpdateOneValidator from 'App/Validators/Tournee/UpdateOneValidator';



export default class TourneesController {

    // Send All the delivery
    public async getAll({ response }: HttpContextContract) {
        const tournees = await Tournee.query().preload('user').preload('creches')
        return response.ok(tournees)
    }


    // create a tournee and assign the tournee to the nursery
    public async createOne({ request, response }: HttpContextContract) {

        const payload = await request.validate(CreateValidator);
        //create tournee without delivery man
        const tournee = new Tournee();
        await Database.transaction(async (trx) => {
            tournee.nom = payload.nom
            await tournee.useTransaction(trx).save();
            const tourneeId = tournee.$attributes.id
            //assign tourneesid to nursery
            const { creches } = payload;
            for (const id of creches) {
                const creche = await Creche.findOrFail(id);
                creche.tourneeId = tourneeId;
                await creche.useTransaction(trx).save();
            }
        })
        const createdTournee = await Tournee.query().where('id', tournee.id).preload('user').preload('creches')
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

        //Check if one of the requests is negative
        if (diffNombreCaisseGant > delivery.nombreCaisseGantSupplementaire) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseGantSupplementaire' });
        } else if (diffNombreCaisseSacPoubelle > delivery.nombreCaisseSacPoubelleSupplementaire) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseSacPoubelleSupplementaire' });
        } else if (diffNombreCaisseInsert > delivery.nombreCaisseInsertSupplementaire) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseInsertSupplementaire' });
        } else if (diffNombreCaisseLingeL > delivery.nombreCaisseLingeLSupplementaire) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseLingeLSupplementaire' });
        } else if (diffNombreCaisseLingeM > delivery.nombreCaisseLingeMSupplementaire) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseLingeMSupplementaire' });
        } else if (diffNombreCaisseLingeS > delivery.nombreCaisseLingeSSupplementaire) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseLingeSSupplementaire' });
        }
        // Update nombreCaisseRestante based on the differences
        delivery.nombreCaisseGantSupplementaire += -diffNombreCaisseGant;
        delivery.nombreCaisseSacPoubelleSupplementaire += -diffNombreCaisseSacPoubelle;
        delivery.nombreCaisseInsertSupplementaire += -diffNombreCaisseInsert;
        delivery.nombreCaisseLingeLSupplementaire += -diffNombreCaisseLingeL;
        delivery.nombreCaisseLingeMSupplementaire += -diffNombreCaisseLingeM;
        delivery.nombreCaisseLingeSSupplementaire += -diffNombreCaisseLingeS;

        await Database.transaction(async (trx) => {
            // Update the state and quantity
            await delivery.useTransaction(trx).save();
            creche.isDelivered = true;
            await creche.useTransaction(trx).save();
        })

        return response.ok({ delivery })
    }



    public async deleteOne({ response, params }: HttpContextContract) {
        const idDelivery = params.id
        const tournee = await Tournee.find(idDelivery)
        if (tournee == null) return response.notFound();
        const creches = await Creche.query().where('tourneeId', tournee.$attributes.id);
        await Database.transaction(async (trx) => {
            if (creches) {
                for (const creche of creches) {
                    creche.$attributes.tourneeId = null;
                    await creche.useTransaction(trx).save();
                }

            }
            await tournee.useTransaction(trx).delete()
        })

        return response.ok({ message: "Delivery deleted" });
    }

    public async updateOne({ response, request }: HttpContextContract) {
        const payload = await request.validate(UpdateOneValidator)
        if (payload.creches) {
            let invalidCreches = '';
            for (const crecheId of payload.creches) {
                const creche = await Creche.findOrFail(crecheId);
                if (creche.tourneeId !== null && creche.tourneeId !== payload.deliveryId) {
                    invalidCreches += (creche.$attributes.nom) + ", "
                }
            }
            if (invalidCreches !== '') {
                return response.badRequest({ message: `These nursery are already in a tournee: ${invalidCreches}` })
            }
        }
        const tournee = await Tournee.findOrFail(payload.deliveryId);
        tournee.nom = payload.nom ?? tournee.nom;
        tournee.pourcentageSupplementaire = payload.pourcentageSupplementaire ?? tournee.pourcentageSupplementaire;
        await Database.transaction(async (trx) => {
            if (payload.creches) {
                await Creche.query().useTransaction(trx).where('tourneeId', tournee.id).whereNotIn('id', payload.creches)
                    .update({ tourneeId: null });
                await Creche.query().useTransaction(trx).whereIn('id', payload.creches)
                    .update({ tourneeId: payload.deliveryId });

            }
            await tournee.useTransaction(trx).save();
        })
        return response.ok({ message: "Delivery has been succesfully updated" })
    }

}



