// app/Controllers/Http/UserController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UserController {
  public async index({ response }: HttpContextContract) {
    const users = await User.all()
    return response.status(200).json(users)
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

  public async storeLivreur({ request, response }: HttpContextContract) {
    const userData = request.only(['nom', 'prenom', 'email', 'password', 'role'])
    userData.role = 'livreur' // Assure-toi de définir le rôle sur 'livreur'
    
    const user = await User.create(userData)
    return response.status(201).json(user)
  }

  public async listLivreurs({ response }: HttpContextContract) {
    const livreurs = await User.query().where('role', 'livreur').select(['nom', 'prenom', 'email'])
    return response.status(200).json(livreurs)
  }
  
}
