import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Creche from './Creche'

export default class Tournee extends BaseModel {
  @column({ isPrimary: true })
  public idTournee: number

  @column()
  public nombreCaisseLingeSLivre?: number

  @column()
  public nombreCaisseLingeMLivre?: number

  @column()
  public nombreCaisseLingeLLivre?: number


  @column()
  public nombreCaisseInsertLivre?: number

  @column()
  public nombreCaisseSacPoubelleLivre?: number

  @column()
  public nombreCaisseGantLivre?: number



  @belongsTo(() => User)
  public users: BelongsTo<typeof User>

  @column()
  public userId: number

  @column()
  public crecheId: number

  @column()
  public isDelivered: boolean

  @column.date()
  public date: DateTime

  @belongsTo(() => Creche)
  public creches: BelongsTo<typeof Creche>



}

