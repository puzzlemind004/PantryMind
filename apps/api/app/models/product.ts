import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import { ProductSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import ProductReference from '#models/product_reference'
import type { NutritionPer100 } from '#types/catalog'

/**
 * Generic product, independent from brands (spec §4.3): "riz basmati",
 * "lait", "œufs"… A null householdId means the product belongs to the
 * global catalogue shared by all households.
 */
export default class Product extends withUuidPrimaryKey(ProductSchema) {
  declare nutritionPer100: NutritionPer100 | null

  /** jsonb array: needs explicit JSON serialization (pg turns JS arrays into array literals). */
  @column({ prepare: (value) => JSON.stringify(value ?? []) })
  declare allergens: string[]

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @hasMany(() => ProductReference)
  declare references: HasMany<typeof ProductReference>

  get isGlobal() {
    return this.householdId === null
  }
}
