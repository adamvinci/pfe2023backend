// app/Controllers/Http/UserController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UserController {

  public async listLivreurs({ response }: HttpContextContract) {
    console.log("de")
    const livreurs = await User.query().where('is_admin', false).select(['id', 'nom'])
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

}
