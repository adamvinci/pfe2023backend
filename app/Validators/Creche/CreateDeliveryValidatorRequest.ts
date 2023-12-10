import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateDeliveryValidator {
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
    nombreCaisseLingeS: schema.number([rules.unsigned()]),
    nombreCaisseLingeM: schema.number([rules.unsigned()]),
    nombreCaisseLingeL: schema.number([rules.unsigned()]),
    nombreCaisseInsert: schema.number([rules.unsigned()]),
    nombreCaisseSacPoubelle: schema.number([rules.unsigned()]),
    nombreCaisseGant: schema.number([rules.unsigned()]),
    nom: schema.string.optional([rules.minLength(3)]),
    gsm: schema.string.optional([rules.minLength(10)]),
    adresse: schema.string.optional([rules.minLength(5), rules.unique({ table: 'creches', column: 'adresse' })]),
    ville: schema.string.optional([rules.minLength(5)]),
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
    'nombreCaisseLingeS.unsigned': 'nombreCaisseLingeS must be >=0',
    'nombreCaisseLingeM.unsigned': 'nombreCaisseLingeM must be >=0',
    'nombreCaisseLingeL.unsigned': 'nombreCaisseLingeL must be >=0',
    'nombreCaisseGant.unsigned': 'nombreCaisseGant must be >=0',
    'nombreCaisseInsert.unsigned': 'nombreCaisseInsert must be >=0',
    'nombreCaisseSacPoubelle.unsigned': 'nombreCaisseSacPoubelle must be >=0'
  }
}
