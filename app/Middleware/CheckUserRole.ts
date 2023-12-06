import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CheckUserRole {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    await auth.authenticate()

    // Get the user
    const user = auth.user!
    console.log(user)
    // Check if the user has the 'admin' role
    if (!user.isAdmin) {
      return response.unauthorized({ error: 'Insufficient permissions' })
    }

    // Continue with the next middleware or route handler
    await next()
  }
}
