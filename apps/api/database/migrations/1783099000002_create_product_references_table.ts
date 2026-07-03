import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_references'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')

      /** EAN barcode; unique when present (spec §4.4). */
      table.string('barcode', 32).nullable().unique()
      table.string('brand').nullable()
      table.string('name').notNullable()

      /** Commercial packaging: e.g. 500 g, 1 l, 6 unit (spec §5.15). */
      table.decimal('package_quantity', 12, 3).nullable()
      table.string('package_unit', 16).nullable()

      table.jsonb('nutrition_per_100').nullable()
      table.string('image_url', 1024).nullable()

      /** Typical shelf life, used to suggest expiry dates when adding stock. */
      table.integer('shelf_life_days').nullable()

      table.enum('source', ['off', 'manual']).notNullable().defaultTo('manual')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
