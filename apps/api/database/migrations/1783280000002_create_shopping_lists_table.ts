import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shopping_lists'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')

      /** One active list per household; completed lists are history (spec §4.11). */
      table.enum('status', ['active', 'completed']).notNullable().defaultTo('active')
      table.timestamp('generated_at').nullable()

      /** Optimistic locking (spec 7.8). */
      table.integer('version').notNullable().defaultTo(1)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['household_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
