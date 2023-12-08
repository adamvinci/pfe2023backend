import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import ChangePasswordValidator from 'App/Validators/Auth/ChangePasswordValidator'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import ResetPasswordValidator from 'App/Validators/Auth/ResetPasswordValidator'
import StoreUserValidator from 'App/Validators/Auth/StoreUserValidator'
import { string } from '@ioc:Adonis/Core/Helpers'
export default class AuthController {
    public async register({ request, response }: HttpContextContract) {
        const payload = await request.validate(StoreUserValidator)

        const user = await User.create(payload)

        return response.created(user) // 201 CREATED
    }

    public async login({ auth, request, response }: HttpContextContract) {
        const { nom, password } = await request.validate(LoginValidator)

        const token = await auth.attempt(nom, password)
        const user = await User.findBy("nom", nom);

        return response.ok({ token, user })
    }

    // Admin can change password of user and his password
    public async updatePassword({ request, response }: HttpContextContract) {
        const { idUser, password } = await request.validate(ChangePasswordValidator)

        const user = await User.findOrFail(idUser);
        user.password = password;
        await user.save();

        return response.ok({ message: 'password changed' })
    }

    // Reset admin password endpoint
    public async forgotPassword({ response, request }: HttpContextContract) {
        const payload = await request.validate(ResetPasswordValidator)
        const user = await User.findByOrFail("nom", payload.email);
        if (!user?.$attributes.isAdmin) response.forbidden({ message: "You cant reset this user password" });
        const newPassword = string.generateRandom(5);

        // Update the user's password in the database
        user.password = newPassword;
        await user.save();

        await Mail.send('emails.newPassword', { user, newPassword }, (message) => {
            message
                .to(user.email)
                .from('noreply@example.com')
                .subject('New Password');
        });
        console.log(user)
    }
}
