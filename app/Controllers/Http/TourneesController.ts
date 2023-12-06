import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tournee from 'App/Models/Tournee'
import User from 'App/Models/User';

export default class TourneesController {


    // Send All the delivery if the token belongs to the admin , if the token belongs to a delivering man it send all its delivery
    public async getAll({ auth, response }: HttpContextContract) {
        const user = auth.user!
        if (user.$extras.isAdmin) {
            const tasks = await Tournee.query().preload('users').preload('creches');
            return response.ok(tasks)
        }
        const tasks = await User.query().where('id', user.id).preload('tournees', (query) => {
            query.preload('creches');
        });
        // const tasks = await Tournee.query().where('userId', user.id).preload('users').preload('creches');
        return response.ok(tasks)
    }

    // uptade isDelivered to true if not already true and if the delivery is assigned to this user
    public async updateState({ params, response, auth }: HttpContextContract) {
        const userId = auth.user!

        const deliveryId = params.id

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
        await delivery.save()

        return response.ok({ delivery })
    }
}



