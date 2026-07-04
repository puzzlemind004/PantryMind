import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shopping_list_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('shopping_list_id')
        .notNullable()
        .references('id')
        .inTable('shopping_lists')
        .onDelete('CASCADE')

      table.uuid('product_id').notNullable().references('id').inTable('products')
      table.string('product_name').notNullable()

      /** Raw need (spec 5.13); commercial packaging on top (spec 5.15). */
      table.decimal('needed_quantity', 12, 3).notNullable()
      table.string('unit', 16).notNullable()

      /** Suggested packaging: N packages of the referenced commercial product. */
      table
        .uuid('product_reference_id')
        .nullable()
        .references('id')
        .inTable('product_references')
        .onDelete('SET NULL')
      table.integer('package_count').nullable()

      /** Where the need comes from (spec 5.13): planning, threshold or manual. */
      table.enum('source', ['planning', 'min_stock', 'manual']).notNullable()

      /** Checked in the shop = added to the stock (spec §8.9). */
      table.timestamp('checked_at').nullable()
      table.uuid('checked_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table
        .uuid('stock_item_id')
        .nullable()
        .references('id')
        .inTable('stock_items')
        .onDelete('SET NULL')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['shopping_list_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
