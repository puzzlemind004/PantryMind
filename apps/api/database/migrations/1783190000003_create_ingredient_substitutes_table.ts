import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ingredient_substitutes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /** Possible replacement products for an ingredient (spec 5.8). */
      table
        .uuid('recipe_ingredient_id')
        .notNullable()
        .references('id')
        .inTable('recipe_ingredients')
        .onDelete('CASCADE')
      table.uuid('product_id').notNullable().references('id').inTable('products')

      table.timestamp('created_at').notNullable()

      table.unique(['recipe_ingredient_id', 'product_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
