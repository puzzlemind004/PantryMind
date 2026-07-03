import type StockMovement from '#models/stock_movement'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class StockMovementTransformer extends BaseTransformer<StockMovement> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'stockItemId',
      'userId',
      'type',
      'quantityDelta',
      'unit',
      'context',
      'createdAt',
    ])
  }
}
