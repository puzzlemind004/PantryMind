import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'storage_locations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')

      table.string('name').notNullable()
      table
        .enum('type', ['fridge', 'freezer', 'pantry', 'cellar', 'other'])
        .notNullable()
        .defaultTo('other')
      table.string('description').nullable()
      table.integer('position').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
