import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tournees'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().nullable().references('users.id').onDelete('CASCADE')
      table.string('nom').notNullable().unique()
      table.double('nombre_caisse_linge_s_aprendre').notNullable().defaultTo(0)
      table.double('nombre_caisse_linge_m_aprendre').notNullable().defaultTo(0)
      table.double('nombre_caisse_linge_l_aprendre').notNullable().defaultTo(0)
      table.double('nombre_caisse_insert_a_prendre').notNullable().defaultTo(0)
      table.double('nombre_caisse_sac_poubelle_a_prendre').notNullable().defaultTo(0)
      table.double('nombre_caisse_gant_a_prendre').nullable().defaultTo(0)
      table.double('nombre_caisse_linge_s_supplementaire').notNullable().defaultTo(0)
      table.double('nombre_caisse_linge_m_supplementaire').notNullable().defaultTo(0)
      table.double('nombre_caisse_linge_l_supplementaire').notNullable().defaultTo(0)
      table.double('nombre_caisse_insert_supplementaire').notNullable().defaultTo(0)
      table.double('nombre_caisse_sac_poubelle_supplementaire').notNullable().defaultTo(0)
      table.double('nombre_caisse_gant_supplementaire').nullable().defaultTo(0)
      table.integer('pourcentage_supplementaire').notNullable().defaultTo(10)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
