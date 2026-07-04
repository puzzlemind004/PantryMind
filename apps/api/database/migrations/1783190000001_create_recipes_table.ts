import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recipes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      /** Recipes belong to one household; cross-household use = copy (spec 7.17). */
      table
        .uuid('household_id')
        .notNullable()
        .references('id')
        .inTable('households')
        .onDelete('CASCADE')

      table.string('name').notNullable()
      table.text('description').nullable()

      /** Reference servings count; planning scales quantities (spec 5.10). */
      table.integer('servings').notNullable().defaultTo(4)
      table.integer('prep_minutes').nullable()
      table.integer('cook_minutes').nullable()

      /** Ordered preparation steps (array of strings). */
      table.jsonb('steps').notNullable().defaultTo('[]')
      /** Free classification tags: végétarien, rapide… (spec §4.7). */
      table.jsonb('tags').notNullable().defaultTo('[]')

      table.string('image_url', 1024).nullable()

      /** Soft delete (spec 7.16): recipes referenced by planned meals are never hard-deleted. */
      table.timestamp('deleted_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['household_id', 'deleted_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
