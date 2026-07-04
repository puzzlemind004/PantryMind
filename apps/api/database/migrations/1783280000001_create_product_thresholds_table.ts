import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_thresholds'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')

      /** Auto-replenishment threshold (spec 5.16): below min → shopping list. */
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table.decimal('min_quantity', 12, 3).notNullable()
      table.string('unit', 16).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['household_id', 'product_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
