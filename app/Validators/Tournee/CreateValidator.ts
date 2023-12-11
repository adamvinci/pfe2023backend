import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'


export default class CreateValidator {
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
    nom: schema.string([rules.minLength(3), rules.unique({ table: 'tournees', column: 'nom' })]),
    creches: schema.array([rules.minLength(1), rules.distinct('*')]).members(schema.number([rules.exists({
      table: 'creches', column: 'id', where: {
        tournee_id: null
      },
    })
    ]),
    ),
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
    unsigned: `{{field}} must be >=0`,
    minLength: `{{field}} must be at least {{options.minLength}} long`,
    'creches.*.exists': 'You cant choose a nursery with a tournee',
    'nom.unique': 'This name is already taken',

  }
}
