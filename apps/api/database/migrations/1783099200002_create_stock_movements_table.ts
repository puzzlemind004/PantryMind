import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_movements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')
      table
        .uuid('stock_item_id')
        .notNullable()
        .references('id')
        .inTable('stock_items')
        .onDelete('CASCADE')
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')

      /**
       * Every stock mutation writes exactly one movement
       * (docs/architecture.md §4.4 — single writing point invariant).
       */
      table
        .enum('type', ['added', 'consumed', 'discarded', 'corrected', 'moved', 'purchased'])
        .notNullable()

      /** Signed quantity change; 0 for pure moves/corrections without quantity. */
      table.decimal('quantity_delta', 12, 3).notNullable().defaultTo(0)
      table.string('unit', 16).notNullable()

      /** Free-form details: reason, previous values, related meal id… */
      table.jsonb('context').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()

      table.index(['household_id', 'created_at'])
      table.index(['stock_item_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
