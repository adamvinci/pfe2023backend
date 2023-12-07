
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Tournee from './Tournee'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nom: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public isAdmin: boolean

  @hasMany(() => Tournee)
  public tournees: HasMany<typeof Tournee>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
