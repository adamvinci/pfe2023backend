import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { validator } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

//verify if the user is admin
validator.rule('isNotAdmin', async (value, _, { pointer, errorReporter }) => {
  const user = await User.find(value);
  if (user && user.isAdmin) {
    errorReporter.report(
      pointer,
      'notAssignable',
      `This user cannot be assigned to a delivery`
    )
  }

})

export default class AssignDeliveryValidator {
  constructor(protected ctx: HttpContextContract) { }

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string([ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string([
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    idDelivery: schema.number([rules.unsigned(), rules.exists({ table: 'tournees', column: 'id' })]),
    idDeliveryMan: schema.number([rules.unsigned(), rules.exists({ table: 'users', column: 'id' }), rules.isNotAdmin()]),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    'idDelivery.exists': 'This tournee does not exists',
    'idDeliveryMan.exists': 'This user does not exists or cant be assigned to a delivery'
  }
}
