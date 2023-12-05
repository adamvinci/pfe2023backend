import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.enum('role', ['admin', 'livreur']).notNullable().defaultTo('livreur')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
