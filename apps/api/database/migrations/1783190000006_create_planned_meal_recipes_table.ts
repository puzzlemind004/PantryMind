import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'planned_meal_recipes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('planned_meal_id')
        .notNullable()
        .references('id')
        .inTable('planned_meals')
        .onDelete('CASCADE')

      /** Indicative link; the source of truth is the snapshot (spec 7.3). */
      table.uuid('recipe_id').nullable().references('id').inTable('recipes').onDelete('SET NULL')

      /** Requested servings; snapshot quantities are scaled by servings/baseServings (spec 5.10). */
      table.decimal('servings', 6, 2).notNullable()

      /**
       * Frozen copy of the recipe at planning time (spec 7.3):
       * { name, baseServings, ingredients: [{ productId, productName,
       *   quantity, unit, optional, substitutes }] }.
       * Never recomputed from the recipe.
       */
      table.jsonb('snapshot').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
