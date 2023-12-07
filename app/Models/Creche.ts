import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Tournee from './Tournee'

export default class Creche extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nom: string

  @column()
  public adresse: string

  @column()
  public ville: string

  @column()
  public gsm: string

  @column()
  public nombreCaisseInsert: number

  @column()
  public nombreCaisseSacPoubelle: number

  @column()
  public nombreCaisseGant: number
  @column()
  public nombreCaisseLingeS: number

  @column()
  public nombreCaisseLingeM: number

  @column()
  public nombreCaisseLingeL: number

  @belongsTo(() => Tournee)
  public tournee: BelongsTo<typeof Tournee>

  @column()
  public tourneeId: number

  @column()
  public isDelivered: boolean
}
