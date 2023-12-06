import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tournees'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_tournee').primary()
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.integer('creche_id').unsigned().notNullable().references('creches.id').onDelete('CASCADE')
      table.date('date').notNullable()
      table.integer('nombre_caisse_linge_s_livre').notNullable()
      table.integer('nombre_caisse_linge_m_livre').notNullable()
      table.integer('nombre_caisse_linge_l_livre').notNullable()
      table.integer('nombre_caisse_insert_livre').notNullable()
      table.integer('nombre_caisse_sac_poubelle_livre').notNullable()
      table.integer('nombre_caisse_gant_livre').nullable()
      table.boolean('is_delivered').notNullable().defaultTo('false')
      table.unique(['user_id', 'creche_id', 'date'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
