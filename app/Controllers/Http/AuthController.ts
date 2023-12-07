import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import ChangePasswordValidator from 'App/Validators/Auth/ChangePasswordValidator'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import StoreUserValidator from 'App/Validators/Auth/StoreUserValidator'

export default class AuthController {
    public async register({ request, response }: HttpContextContract) {
        const payload = await request.validate(StoreUserValidator)

        const user = await User.create(payload)

        return response.created(user) // 201 CREATED
    }

    public async login({ auth, request, response }: HttpContextContract) {
        const { nom, password } = await request.validate(LoginValidator)

        const token = await auth.attempt(nom, password)

        return response.ok(token)
    }

    // Admin can change password of user and his password
    public async updatePassword({ request, response }: HttpContextContract) {
        const { idUser, password } = await request.validate(ChangePasswordValidator)

        const user = await User.find(idUser);
        if (user) {
            user.password = password;
            await user.save();
        }
        return response.ok({ message: 'password changed' })
    }

    // Admin can change password of user and his password
    public async resetPasswordAdmin({ response }: HttpContextContract) {

        const user = await User.findBy('is_admin', true);
        console.log(user)

    }
}
