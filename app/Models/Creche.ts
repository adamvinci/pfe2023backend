// app/Models/Creche.ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Creche extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nom: string

  @column()
  public adresse: string

  @column()
  public gsm: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
