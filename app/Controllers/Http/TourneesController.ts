import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tournee from 'App/Models/Tournee'
import User from 'App/Models/User';

export default class TourneesController {

    public async getAll({ auth, response }: HttpContextContract) {
        const user = auth.user!
        if (user.$extras.isAdmin) {
            const tasks = await Tournee.query().preload('users').preload('creches');
            return response.ok(tasks)
        }
        const tasks = await User.query().preload('tournees', (query) => {
            query.preload('creches');
        }).first();
        // const tasks = await Tournee.query().where('userId', user.id).preload('users').preload('creches');
        return response.ok(tasks)
    }

}
