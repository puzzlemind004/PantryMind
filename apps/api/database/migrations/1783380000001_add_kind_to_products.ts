import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /**
       * Product kind (spec 5.21): stock and shopping accept everything,
       * recipes/nutrition/recommendations are food-only. Existing
       * products are food (nothing else could exist before this rule).
       */
      table
        .enum('kind', ['food', 'cleaning', 'hygiene', 'pet', 'other'])
        .notNullable()
        .defaultTo('food')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('kind')
    })
  }
}
