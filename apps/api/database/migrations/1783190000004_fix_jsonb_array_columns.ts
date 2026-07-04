import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Repairs jsonb array columns written as '{}' instead of '[]': the pg
 * driver serialized empty JS arrays as Postgres array literals, which
 * parse as empty JSON objects. Non-empty arrays failed loudly, so only
 * empty values can be affected.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(
        `UPDATE products SET allergens = '[]'::jsonb WHERE jsonb_typeof(allergens) <> 'array'`
      )
      await db.rawQuery(
        `UPDATE recipes SET steps = '[]'::jsonb WHERE jsonb_typeof(steps) <> 'array'`
      )
      await db.rawQuery(`UPDATE recipes SET tags = '[]'::jsonb WHERE jsonb_typeof(tags) <> 'array'`)
    })
  }

  async down() {
    /** Data repair only — nothing to revert. */
  }
}
