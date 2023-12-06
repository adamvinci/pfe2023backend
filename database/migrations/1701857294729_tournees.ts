import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tournees'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_tournee').primary()
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.integer('creche_id').unsigned().notNullable().references('creches.id').onDelete('CASCADE')
      table.date('date').notNullable()
      table.integer('nombreCaisseLinge').nullable()
      table.integer('nombreCaisseInsert').nullable()
      table.integer('nombreCaisseSacPoubelle').nullable()
      table.integer('nombreCaisseGant').nullable()
      table.string('tailleCouche').nullable()
      table.decimal('pourcentageSupplement', 5, 2).notNullable().defaultTo(10.0)
      table.unique(['user_id', 'creche_id', 'date'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
