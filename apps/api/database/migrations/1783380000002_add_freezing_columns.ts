import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('products', (table) => {
      /** Recommended freezer shelf life in days (spec 5.22); null = household default. */
      table.integer('freeze_shelf_life_days').nullable()
    })
    this.schema.alterTable('stock_items', (table) => {
      /** Set when the lot was frozen (spec 5.22); a frozen lot cannot be re-frozen. */
      table.timestamp('frozen_at').nullable()
    })
    /**
     * New movement type 'frozen': knex enum() is a check constraint, so
     * it must be recreated to accept the new value.
     */
    this.defer(async (db) => {
      await db.rawQuery(
        'ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_type_check'
      )
      await db.rawQuery(
        `ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_type_check
         CHECK (type IN ('added','consumed','discarded','corrected','moved','purchased','frozen'))`
      )
    })
  }

  async down() {
    this.schema.alterTable('products', (table) => {
      table.dropColumn('freeze_shelf_life_days')
    })
    this.schema.alterTable('stock_items', (table) => {
      table.dropColumn('frozen_at')
    })
  }
}
