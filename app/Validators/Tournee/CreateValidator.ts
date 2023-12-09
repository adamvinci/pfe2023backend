import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'




//verify if these nursery are not already assigned to a delivery work sometimes
/*validator.rule('nurseryAlreadyAssigned', async (value, _, options) => {
  const creche = await Creche.findOrFail(value)
  if (creche.$attributes.tourneeId !== null) {
      options.errorReporter.report(
          'nurseryAlreadyAssigned',
          `This nursery: ${creche.$attributes.nom} is already associated with a tournee`,
      )
  }
});*/
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
    creches: schema.array([rules.minLength(1)]).members(schema.number([rules.exists({ table: 'creches', column: 'id' })])),
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
  public messages: CustomMessages = {}
}
