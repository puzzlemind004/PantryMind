import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')

      /** Products carrying stock cannot be deleted (spec 7.16). */
      table.uuid('product_id').notNullable().references('id').inTable('products')
      table
        .uuid('product_reference_id')
        .nullable()
        .references('id')
        .inTable('product_references')
        .onDelete('SET NULL')

      /** One row = one physical lot, never aggregated (spec §4.5). */
      table.decimal('quantity', 12, 3).notNullable()
      table.string('unit', 16).notNullable()
      table
        .uuid('storage_location_id')
        .nullable()
        .references('id')
        .inTable('storage_locations')
        .onDelete('SET NULL')

      table
        .enum('status', ['available', 'consumed', 'discarded'])
        .notNullable()
        .defaultTo('available')

      table.timestamp('added_at').notNullable()
      /** Best-before / use-by date when known (spec §4.5). */
      table.date('expires_at').nullable()

      /** Optimistic locking counter (spec 7.8), enforced from Lot 2. */
      table.integer('version').notNullable().defaultTo(1)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['household_id', 'status'])
      table.index(['household_id', 'expires_at'])
      table.index(['household_id', 'product_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
