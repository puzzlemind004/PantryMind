import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /** Null = global catalogue entry shared by all households (spec §6.2). */
      table
        .uuid('household_id')
        .nullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')

      table.string('name').notNullable()
      table.string('category').nullable()

      /** Canonical unit for recipes and stock: g, kg, ml, l, unit… (spec §4.3) */
      table.string('default_unit', 16).notNullable().defaultTo('g')

      /** Optional conversion factors (spec §5.6): 1 unit ≈ N grams, density g/ml. */
      table.decimal('unit_weight_grams', 12, 3).nullable()
      table.decimal('density_g_per_ml', 8, 4).nullable()

      /** Nutrition per 100 g/ml: kcal, proteins, carbs, fat… (spec §4.3) */
      table.jsonb('nutrition_per_100').nullable()
      table.jsonb('allergens').notNullable().defaultTo('[]')

      /** CIQUAL food code for generic nutrition enrichment (Lot 4). */
      table.string('ciqual_code', 16).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['household_id', 'name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
