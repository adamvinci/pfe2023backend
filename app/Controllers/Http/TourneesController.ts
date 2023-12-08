import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Creche from 'App/Models/Creche';
import Tournee from 'App/Models/Tournee'
import User from 'App/Models/User';
import AssignDeliveryValidator from 'App/Validators/Tournee/AssignDeliveryValidator';
import CreateValidator from 'App/Validators/Tournee/CreateValidator';
import UpdateCommandValidator from 'App/Validators/Tournee/UpdateCommandValidator';



export default class TourneesController {

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
            const creche = await Creche.find(id);
            if (creche) {
                creche.tourneeId = tourneeId;
            }
            await creche?.save();
        })
        const createdTournee = await Tournee.query().where('id', tourneeId).preload('user').preload('creches')
        return response.ok({ createdTournee })
    }

    // Send All the delivery if the token belongs to the admin , if the token belongs to a delivering man it send all its delivery for today
    public async getAll({ auth, response }: HttpContextContract) {
        const user = auth.user!

        if (user.$original.isAdmin) {
            const tournees = await Tournee.query().preload('user').preload('creches')
            console.log()
            return response.ok(tournees)
        }
        const tourneesByUser = await User.query().where('id', user.id).preload('tournees', (query) => {
            query.preload('creches');
        });
        return response.ok(tourneesByUser)
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

        const creche = await Creche.find(nurseryId)
        if (creche === null) {
            return response.badRequest({ message: 'This nursery does not exist' })
        }
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



    public async chooseDelivery({ auth, request, response, }: HttpContextContract) {

        const { idDelivery, idDeliveryMan } = await request.validate(AssignDeliveryValidator);

        if (auth.user?.id !== idDeliveryMan) return response.badRequest({ message: "You cant assign someone else than yourself" })
        if (auth.user?.isAdmin) return response.badRequest({ message: "This user cant delivery" })

        const delivery = await Tournee.find(idDelivery);
        if (delivery && !delivery.userId) {
            delivery.userId = idDeliveryMan;
            await delivery.save();
            return response.ok({ message: "You have been assigned to this delivery" })
        } else {
            if (delivery?.userId == auth.user.id) {
                return response.ok({ message: "You have already been added to this delivery" })
            }
            return response.conflict({ message: "Someone else took over this delivery" })
        }
    }


}



