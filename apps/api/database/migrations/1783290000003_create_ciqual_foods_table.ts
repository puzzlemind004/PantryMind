import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ciqual_foods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /** ANSES CIQUAL reference for generic products (décision projet). */
      table.string('code', 16).notNullable().unique()
      table.string('name', 255).notNullable()
      table.jsonb('nutrition_per_100').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
