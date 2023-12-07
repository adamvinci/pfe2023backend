import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'creches'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nom').notNullable()
      table.string('adresse').notNullable().unique()
      table.string('gsm').notNullable()
      table.string('ville').notNullable()
      table.integer('nombre_caisse_linge_s').nullable()
      table.integer('nombre_caisse_linge_m').nullable()
      table.integer('nombre_caisse_linge_l').nullable()
      table.integer('nombre_caisse_insert').nullable()
      table.integer('nombre_caisse_sac_poubelle').nullable()
      table.integer('nombre_caisse_gant').nullable()
      table.integer('tournee_id').unsigned().nullable().references('tournees.id')
      table.boolean('is_delivered').notNullable().defaultTo('false')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
