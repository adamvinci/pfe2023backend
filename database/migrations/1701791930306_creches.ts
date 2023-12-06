import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Creches extends BaseSchema {
  protected tableName = 'creches'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nom').notNullable()
      table.string('adresse').notNullable()
      table.string('gsm').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
