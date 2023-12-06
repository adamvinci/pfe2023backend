import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tournees'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_tournee').primary()
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.integer('creche_id').unsigned().notNullable().references('creches.id').onDelete('CASCADE')
      table.date('date').notNullable()
      table.integer('nombre_caisse_linge').nullable()
      table.integer('nombre_caisse_insert').nullable()
      table.integer('nombre_caisse_sac_poubelle').nullable()
      table.integer('nombre_caisse_gant').nullable()
      table.string('taille_couche').nullable()
      table.decimal('pourcentage_supplement', 5, 2).notNullable().defaultTo(10.0)
      table.unique(['user_id', 'creche_id', 'date'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
