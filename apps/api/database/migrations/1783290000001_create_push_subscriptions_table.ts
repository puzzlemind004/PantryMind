import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'push_subscriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')

      /** Web Push endpoint + client keys (spec §6.6). */
      table.text('endpoint').notNullable().unique()
      table.string('p256dh', 255).notNullable()
      table.string('auth', 64).notNullable()

      table.timestamp('created_at').notNullable()

      table.index(['household_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
