import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Creche from 'App/Models/Creche';
import Tournee from 'App/Models/Tournee'
import User from 'App/Models/User';
import AssignDeliveryValidator from 'App/Validators/Tournee/AssignDeliveryValidator';
import UpdateCommandValidator from 'App/Validators/Tournee/UpdateCommandValidator';

import { DateTime } from 'luxon';

export default class TourneesController {


    // Send All the delivery if the token belongs to the admin , if the token belongs to a delivering man it send all its delivery for today
    public async getAll({ auth, response }: HttpContextContract) {
        const user = auth.user!
        if (user.$extras.isAdmin) {
            const tasks = await Tournee.query().preload('users').preload('creches');
            return response.ok(tasks)
        }
        const tasks = await User.query().where('id', user.id).preload('tournees', (query) => {
            const today = DateTime.local().toFormat('yyyy-MM-dd');
            query.where('date', today).preload('creches');
        });
        // const tasks = await Tournee.query().where('userId', user.id).preload('users').preload('creches');
        return response.ok(tasks)
    }

    // uptade isDelivered to true if not already true and if the delivery is assigned to this user
    public async updateCommandStateAndQuantity({ params, request, response, auth }: HttpContextContract) {
        const userId = auth.user!

        const deliveryId = params.id
        const payload = await request.validate(UpdateCommandValidator)
        // Check if this delivery is assigned to this user
        const delivery = await Tournee.query()
            .where('id_tournee', deliveryId)
            .where('user_id', userId.id)
            .first()

        if (delivery == null) {
            return response.notFound({ message: 'This delivery is not assigned to this delivery man' });
        }

        // Check if the tournee has already been delivered
        if (delivery.isDelivered) {
            return response.badRequest({ message: 'Tournee has already been delivered' })
        }

        // Update the state
        delivery.isDelivered = true;

        await delivery.merge(payload).save();

        return response.ok({ delivery })
    }

    /*   public async assignDelivery({ params, response, }: HttpContextContract) {
 
         const { idCreche, idDeliveryMan } = await params.validate(AssignDeliveryValidator);
         const creche = Creche.find(idCreche);
         const deliveryMan = User.find(idDeliveryMan);
         if (creche == null || deliveryMan == null) {
             response.notFound({ message: 'DeliveryMan or nursery id does not exist' })
         }
         const delivery = await Tournee.query()
             .where('creche_id', idCreche)
 
         if (delivery == null) {
             //create for each two days depending on creche.jourdelivrasion 
 
             return response.ok({ message: "The delivery for this nursery have been created" })
         } else {
             //replace the user_id in tournee by the new deliveryMan
 
             response.ok({ message: "The delivery man has been updated" })
         }
 
     }*/


}



