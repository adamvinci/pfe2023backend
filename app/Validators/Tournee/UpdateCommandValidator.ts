import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateCommandValidator {
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
    nombreCaisseGantLivre: schema.number([rules.unsigned()]),
    nombreCaisseSacPoubelleLivre: schema.number([rules.unsigned()]),
    nombreCaisseInsertLivre: schema.number([rules.unsigned()]),
    nombreCaisseLingeLLivre: schema.number([rules.unsigned()]),
    nombreCaisseLingeMLivre: schema.number([rules.unsigned()]),
    nombreCaisseLingeSLivre: schema.number([rules.unsigned()]),
    nurseryId: schema.number([rules.unsigned(), rules.exists({ table: 'creches', column: 'id' })]),
    deliveryId: schema.number([rules.unsigned(), rules.exists({ table: 'tournees', column: 'id' })]),
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
    exists: `This {{field}} does not exist`,
    required: `This {{field}} is required`
  }
}
