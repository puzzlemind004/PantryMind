import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recipe_ingredients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('recipe_id').notNullable().references('id').inTable('recipes').onDelete('CASCADE')

      /** Generic product (spec §4.8); products used by recipes cannot be deleted (spec 7.16). */
      table.uuid('product_id').notNullable().references('id').inTable('products')

      table.decimal('quantity', 12, 3).notNullable()
      table.string('unit', 16).notNullable()

      /** Optional ingredients never block the recipe (spec 5.9). */
      table.boolean('optional').notNullable().defaultTo(false)
      table.string('note').nullable()
      table.integer('position').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
