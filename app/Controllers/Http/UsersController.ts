// app/Controllers/Http/UserController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UserController {
  public async index({ response }: HttpContextContract) {
    const users = await User.all()
    return response.status(200).json(users)
  }
  public async listLivreurs({ response }: HttpContextContract) {
    const list = {"hello":"shesh"}
    return response.status(200).json(list)
  }

  public async show({ params, response }: HttpContextContract) {
    const user = await User.find(params.id)
    if (!user) {
      return response.status(404).json({ message: 'Utilisateur non trouvé' })
    }
    return response.status(200).json(user)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const user = await User.find(params.id)
    if (!user) {
      return response.status(404).json({ message: 'Utilisateur non trouvé' })
    }
    const userData = request.only(['nom', 'prenom', 'email', 'password', 'role'])
    user.merge(userData)
    await user.save()
    return response.status(200).json(user)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const user = await User.find(params.id)
    if (!user) {
      return response.status(404).json({ message: 'Utilisateur non trouvé' })
    }
    await user.delete()
    return response.status(204)
  }

  public async addLivreur({ request, response }: HttpContextContract) {
    const userData = request.only(['email', 'password','isAdmin'])
    userData.isAdmin = false
    const user = new User()
    user.email = userData.email
    user.password = userData.password
    user.isAdmin = userData.isAdmin

    await user.save()
    return response.status(201).json(user)
  }

  
  
}
