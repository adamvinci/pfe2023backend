// app/Models/User.ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nom: string

  @column()
  public prenom: string

  @column()
  public email: string

  @column()
  public password: string

  @column()
  public role: 'admin' | 'livreur'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
