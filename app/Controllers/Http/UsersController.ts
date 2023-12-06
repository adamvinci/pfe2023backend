// app/Controllers/Http/UserController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UserController {

  public async listLivreurs({ response }: HttpContextContract) {
    const livreurs = await User.query().where('is_admin', false).select(['email'])
    if (livreurs == null) return response.noContent();
    return response.ok(livreurs)
  }


}
