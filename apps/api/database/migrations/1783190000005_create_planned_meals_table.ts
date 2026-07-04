import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'planned_meals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')

      table.date('date').notNullable()

      /**
       * Meal type reference + a copied label so the planned meal
       * survives a meal type deletion (spec §4.10).
       */
      table
        .uuid('meal_type_id')
        .nullable()
        .references('id')
        .inTable('meal_types')
        .onDelete('SET NULL')
      table.string('meal_name').notNullable()

      /** Overrides the meal type default time when set (spec §4.10). */
      table.time('time_override').nullable()

      /** planned → done|cancelled ; the stock only moves on "done" (spec 5.2). */
      table.enum('status', ['planned', 'done', 'cancelled']).notNullable().defaultTo('planned')
      table.string('notes', 500).nullable()

      /** Optimistic locking (spec 7.8). */
      table.integer('version').notNullable().defaultTo(1)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['household_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
