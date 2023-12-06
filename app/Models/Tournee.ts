import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Creche from './Creche'

export default class Tournee extends BaseModel {
  @column({ isPrimary: true })
  public idTournee: number

  @column()
  public nombreCaisseLinge?: number

  @column()
  public nombreCaisseInsert?: number

  @column()
  public nombreCaisseSacPoubelle?: number

  @column()
  public nombreCaisseGant?: number

  @column()
  public tailleCouche?: string

  @column()
  public pourcentageSupplement: number

  @belongsTo(() => User)
  public users: BelongsTo<typeof User>

  @column()
  public userId: number

  @column()
  public crecheId: number


  @column.date()
  public date: DateTime

  @belongsTo(() => Creche)
  public creches: BelongsTo<typeof Creche>



}

