// app/Controllers/Http/UserController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UserController {
  public async index({ response }: HttpContextContract) {
    const users = await User.all()
    return response.status(200).json(users)
  }

  public async listLivreurs({ response }: HttpContextContract) {
    const livreurs = await User.query().where('is_admin', false).select(['email'])
    return response.ok(livreurs)
  }

  public async addLivreur({ request, response }: HttpContextContract) {
    const userData = request.only(['email', 'password', 'is_admin'])

    const user = new User()
    user.email = userData.email
    user.password = userData.password
    user.is_admin = userData.is_admin ?? false // Par défaut, un livreur n'est pas un admin s'il n'y a pas de valeur fournie

    await user.save()
    return response.status(201).json(user)
  }




}
