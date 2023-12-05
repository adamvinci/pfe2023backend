import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import StoreUserValidator from 'App/Validators/Auth/StoreUserValidator'

export default class AuthController {
    public async register({ request, response }: HttpContextContract) {
        console.log(request)
        const payload = await request.validate(StoreUserValidator)

        const user = await User.create(payload)

        return response.created(user) // 201 CREATED
    }

    public async login({ auth, request, response }: HttpContextContract) {

        const { email, password } = await request.validate(LoginValidator)

        const token = await auth.attempt(email, password)

        return response.ok(token)
    }
}
