import { schema, rules, validator, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Creche from 'App/Models/Creche';


validator.rule('nurseryAlreadyAssigned', async (values, _, options) => {
  for (const crecheId of values) {
    const creche = await Creche.find(crecheId);
    if (creche) {
      if (creche.tourneeId !== null && creche.tourneeId !== options.root.deliveryId)
        options.errorReporter.report(
          'nurseryAlreadyAssigned',
          `The nursery ${creche.nom} is already associated with a tournee`,
        )
    }

  }
});
export default class UpdateOneValidator {
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
    deliveryId: schema.number([rules.unsigned(), rules.exists({ table: 'tournees', column: 'id' })]),
    nom: schema.string.optional([rules.minLength(3), rules.unique({ table: 'tournees', column: 'nom' })]),
    pourcentageSupplementaire: schema.number.optional([rules.unsigned()]),
    creches: schema.array.optional([rules.nurseryAlreadyAssigned(), rules.distinct('*'), rules.minLength(1)])
      .members(schema.number([rules.exists({ table: 'creches', column: 'id' })])),
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
    'creches.*.exists': 'This nursery does not exist',
    'pourcentageSupplementaire.unsigned': 'Pourcentage must be >=0'
  }


}
