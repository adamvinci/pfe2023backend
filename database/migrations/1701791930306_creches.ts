import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Creches extends BaseSchema {
  protected tableName = 'creches'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nom').notNullable()
      table.string('adresse').notNullable()
      table.string('gsm').notNullable()
      table.integer('nombre_caisse_linge_s').nullable()
      table.integer('nombre_caisse_linge_m').nullable()
      table.integer('nombre_caisse_linge_l').nullable()
      table.integer('nombre_caisse_insert').nullable()
      table.integer('nombre_caisse_sac_poubelle').nullable()
      table.integer('nombre_caisse_gant').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
