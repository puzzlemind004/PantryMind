import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'household_invitations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')
      table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL')

      /** Short shareable code used to join the household (spec §10.3) */
      table.string('code', 32).notNullable().unique()
      table.enum('role', ['admin', 'member', 'viewer']).notNullable().defaultTo('member')
      table.timestamp('expires_at').notNullable()
      table.timestamp('revoked_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
