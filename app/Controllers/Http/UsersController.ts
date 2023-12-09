// app/Controllers/Http/UserController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tournee from 'App/Models/Tournee';
import User from 'App/Models/User'
import AssignDeliveryValidator from 'App/Validators/Creche/AssignDeliveryValidator';

export default class UserController {

  public async listLivreurs({ response }: HttpContextContract) {
    const livreurs = await User.all();
    if (livreurs == null) return response.noContent();
    return response.ok(livreurs)
  }

  public async deleteOne({ response, params }: HttpContextContract) {
    const idUser = params.id
    const livreur = await User.find(idUser)
    if (livreur == null) return response.notFound();
    if (livreur.isAdmin) return response.forbidden({ message: "This user cannot be deleted" });
    livreur.delete()
    return response.ok({ message: "User deleted" });
  }

  public async getDelivery({ auth, response }: HttpContextContract) {
    if (auth.user!.$attributes.isAdmin) {
      const tournees = await Tournee.query().whereNotNull("userId").preload('user').preload('creches')
      if (tournees.length === 0) return response.ok({ message: "No delivery assigned for today" });
      return response.ok(tournees)
    }
    const tournees = await Tournee.query().where('userId', auth.user!.id).preload('creches')
    if (tournees.length === 0) return response.ok({ message: "You dont have delivery selected for today" });
    return response.ok(tournees)
  }

  public async chooseDelivery({ auth, request, response, }: HttpContextContract) {
    const { idDelivery, idDeliveryMan } = await request.validate(AssignDeliveryValidator);

    if (auth.user?.id !== idDeliveryMan) return response.badRequest({ message: "You cant assign someone else than yourself" })
    if (auth.user?.isAdmin) return response.badRequest({ message: "This user cant delivery" })

    const delivery = await Tournee.findOrFail(idDelivery);
    if (!delivery.userId) {
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
