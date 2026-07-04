import type ShoppingList from '#models/shopping_list'
import type ShoppingListItem from '#models/shopping_list_item'
import { BaseTransformer } from '@adonisjs/core/transformers'

/** Items as plain objects (deep-nested transformers are not resolved). */
function itemSummary(item: ShoppingListItem) {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    neededQuantity: item.neededQuantity,
    unit: item.unit,
    source: item.source,
    packageCount: item.packageCount,
    packaging:
      item.productReference && item.packageCount
        ? {
            referenceId: item.productReference.id,
            name: item.productReference.name,
            brand: item.productReference.brand,
            packageQuantity: item.productReference.packageQuantity,
            packageUnit: item.productReference.packageUnit,
          }
        : null,
    checkedAt: item.checkedAt?.toISO() ?? null,
  }
}

export default class ShoppingListTransformer extends BaseTransformer<ShoppingList> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'householdId', 'status', 'version']),
      generatedAt: this.resource.generatedAt?.toISO() ?? null,
      items: this.resource.items?.map(itemSummary),
    }
  }
}
