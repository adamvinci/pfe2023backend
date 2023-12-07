import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Creche from './Creche'

export default class Tournee extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nombreCaisseLingeSRestante: number

  @column()
  public nombreCaisseLingeMRestante: number

  @column()
  public nombreCaisseLingeLRestante: number


  @column()
  public nombreCaisseInsertRestante: number

  @column()
  public nombreCaisseSacPoubelleRestante: number

  @column()
  public nombreCaisseGantRestante: number

  @column()
  public pourcentageSupplementaire: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public userId: number

  @hasMany(() => Creche)
  public creches: HasMany<typeof Creche>

}

