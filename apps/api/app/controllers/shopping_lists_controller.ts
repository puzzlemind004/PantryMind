import type { HttpContext } from '@adonisjs/core/http'

import { toDateTime } from '#helpers/dates'
import ShoppingListItem from '#models/shopping_list_item'
import StorageLocation from '#models/storage_location'
import ShoppingService from '#services/shopping_service'
import ShoppingListTransformer from '#transformers/shopping_list_transformer'
import {
  addShoppingItemValidator,
  checkShoppingItemValidator,
  generateShoppingListValidator,
  updateShoppingItemValidator,
} from '#validators/shopping'

export default class ShoppingListsController {
  /** The single active list, created lazily (spec §4.11). */
  async show({ household, serialize }: HttpContext) {
    const list = await ShoppingService.activeList(household)
    await ShoppingService.loadItems(list)
    return serialize(ShoppingListTransformer.transform(list))
  }

  /** Regenerates the computed items (spec 5.13) — manual/checked kept. */
  async generate({ household, auth, request, serialize }: HttpContext) {
    const { days } = await request.validateUsing(generateShoppingListValidator)

    const list = await ShoppingService.generate(household, auth.getUserOrFail(), { days })

    return serialize(ShoppingListTransformer.transform(list))
  }

  async addItem({ household, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(addShoppingItemValidator)
    void auth

    const list = await ShoppingService.activeList(household)
    await ShoppingService.addManualItem(list, household, payload)
    await ShoppingService.loadItems(list)

    response.status(201)
    return serialize(ShoppingListTransformer.transform(list))
  }

  async updateItem({ household, params, request, response, serialize }: HttpContext) {
    const { quantity } = await request.validateUsing(updateShoppingItemValidator)

    const item = await this.findItem(household.id, params.itemId)
    if (!item) {
      return this.notFound(response)
    }

    item.neededQuantity = quantity
    await item.save()
    return serialize({ id: item.id, neededQuantity: item.neededQuantity })
  }

  async destroyItem({ household, params, response }: HttpContext) {
    const item = await this.findItem(household.id, params.itemId)
    if (!item) {
      return this.notFound(response)
    }

    await item.delete()
    return response.noContent()
  }

  /** Checking = the article enters the stock (spec §8.9, 7.12). */
  async checkItem({ household, params, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(checkShoppingItemValidator)

    const item = await this.findItem(household.id, params.itemId)
    if (!item) {
      return this.notFound(response)
    }

    if (payload.storageLocationId) {
      const location = await StorageLocation.query()
        .where('id', payload.storageLocationId)
        .where('household_id', household.id)
        .first()
      if (!location) {
        return response.unprocessableEntity({
          errors: [{ code: 'LOCATION_NOT_FOUND', message: 'Unknown storage location' }],
        })
      }
    }

    await ShoppingService.checkItem(item, household, auth.getUserOrFail(), {
      storageLocationId: payload.storageLocationId ?? null,
      expiresAt: payload.expiresAt ? toDateTime(payload.expiresAt) : null,
    })

    const list = await ShoppingService.activeList(household)
    await ShoppingService.loadItems(list)
    return serialize(ShoppingListTransformer.transform(list))
  }

  async uncheckItem({ household, params, response, serialize }: HttpContext) {
    const item = await this.findItem(household.id, params.itemId)
    if (!item) {
      return this.notFound(response)
    }

    await ShoppingService.uncheckItem(item)

    const list = await ShoppingService.activeList(household)
    await ShoppingService.loadItems(list)
    return serialize(ShoppingListTransformer.transform(list))
  }

  private async findItem(householdId: string, itemId: string) {
    return ShoppingListItem.query()
      .where('id', itemId)
      .whereHas('shoppingList', (query) => {
        query.where('household_id', householdId).where('status', 'active')
      })
      .first()
  }

  private notFound(response: HttpContext['response']) {
    return response.notFound({
      errors: [{ code: 'ITEM_NOT_FOUND', message: 'Shopping list item not found' }],
    })
  }
}
