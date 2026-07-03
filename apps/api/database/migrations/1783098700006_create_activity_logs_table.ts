import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activity_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')

      /** e.g. "household.updated", "storage_location.created" */
      table.string('action').notNullable()
      table.string('subject_type').nullable()
      table.uuid('subject_id').nullable()
      table.jsonb('data').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()

      table.index(['household_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
