import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'planned_meals'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /** Meal-time reminder already sent / auto-validation already done (spec 5.2). */
      table.timestamp('notified_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('notified_at')
    })
  }
}
