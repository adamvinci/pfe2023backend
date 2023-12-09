import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Creche from './Creche'

export default class Tournee extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nombreCaisseLingeSAprendre: number

  @column()
  public nombreCaisseLingeMAprendre: number

  @column()
  public nombreCaisseLingeLAprendre: number

  @column()
  public nombreCaisseInsertAPrendre: number

  @column()
  public nombreCaisseSacPoubelleAPrendre: number

  @column()
  public nombreCaisseGantAPrendre: number

  @column()
  public nombreCaisseLingeSSupplementaire: number

  @column()
  public nombreCaisseLingeMSupplementaire: number

  @column()
  public nombreCaisseLingeLSupplementaire: number

  @column()
  public nombreCaisseInsertSupplementaire: number

  @column()
  public nombreCaisseSacPoubelleSupplementaire: number

  @column()
  public nombreCaisseGantSupplementaire: number

  @column()
  public pourcentageSupplementaire: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public userId: number

  @hasMany(() => Creche)
  public creches: HasMany<typeof Creche>

  @column()
  public nom: String

}

