import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import { ShoppingListSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Household from '#models/household'
import ShoppingListItem from '#models/shopping_list_item'

/**
 * Shopping list (spec §4.11): the consolidated result of the planning,
 * the current stock and the minimum thresholds — always recomputable,
 * always manually editable (spec 5.13).
 */
export default class ShoppingList extends withUuidPrimaryKey(ShoppingListSchema) {
  declare status: 'active' | 'completed'

  @belongsTo(() => Household)
  declare household: BelongsTo<typeof Household>

  @hasMany(() => ShoppingListItem)
  declare items: HasMany<typeof ShoppingListItem>
}
