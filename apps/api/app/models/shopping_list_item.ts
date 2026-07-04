import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { ShoppingListItemSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import Product from '#models/product'
import ProductReference from '#models/product_reference'
import ShoppingList from '#models/shopping_list'
import StockItem from '#models/stock_item'

/** One article to buy; checked in the shop = entered the stock (spec §8.9). */
export default class ShoppingListItem extends withUuidPrimaryKey(ShoppingListItemSchema) {
  declare source: 'planning' | 'min_stock' | 'manual'

  @belongsTo(() => ShoppingList)
  declare shoppingList: BelongsTo<typeof ShoppingList>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => ProductReference)
  declare productReference: BelongsTo<typeof ProductReference>

  @belongsTo(() => StockItem)
  declare stockItem: BelongsTo<typeof StockItem>
}
