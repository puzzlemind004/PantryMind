import type { HttpContext } from '@adonisjs/core/http'

import Product from '#models/product'
import ProductThreshold from '#models/product_threshold'
import { upsertThresholdValidator } from '#validators/shopping'

/** Auto-replenishment thresholds per product (spec 5.16). */
export default class ProductThresholdsController {
  async index({ household, serialize }: HttpContext) {
    const thresholds = await ProductThreshold.query()
      .where('household_id', household.id)
      .preload('product')
      .orderBy('created_at', 'asc')

    return serialize({
      thresholds: thresholds.map((threshold) => ({
        id: threshold.id,
        productId: threshold.productId,
        productName: threshold.product.name,
        minQuantity: threshold.minQuantity,
        unit: threshold.unit,
      })),
    })
  }

  /** Idempotent upsert: one threshold per product and household. */
  async upsert({ household, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(upsertThresholdValidator)

    const product = await Product.query()
      .where('id', payload.productId)
      .where((scope) => {
        scope.whereNull('household_id').orWhere('household_id', household.id)
      })
      .first()
    if (!product) {
      return response.unprocessableEntity({
        errors: [{ code: 'PRODUCT_NOT_FOUND', message: 'Unknown product for this household' }],
      })
    }

    const threshold = await ProductThreshold.updateOrCreate(
      { householdId: household.id, productId: payload.productId },
      { minQuantity: payload.minQuantity, unit: payload.unit }
    )

    return serialize({
      id: threshold.id,
      productId: threshold.productId,
      productName: product.name,
      minQuantity: threshold.minQuantity,
      unit: threshold.unit,
    })
  }

  async destroy({ household, params, response }: HttpContext) {
    const threshold = await ProductThreshold.query()
      .where('household_id', household.id)
      .where('id', params.thresholdId)
      .first()
    if (!threshold) {
      return response.notFound({
        errors: [{ code: 'THRESHOLD_NOT_FOUND', message: 'Threshold not found' }],
      })
    }

    await threshold.delete()
    return response.noContent()
  }
}
