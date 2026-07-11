import Product from '#models/product'
import StockItem from '#models/stock_item'
import UnitService from '#services/unit_service'

export interface AvailabilityRequest {
  productId: string
  unit: string
}

/**
 * Read-only stock availability (simulation): sums available lots of a
 * product converted into a requested unit. Used by recipe feasibility
 * (spec §8.7) and meal validation preview (spec §8.6) — never marks or
 * reserves anything (spec 5.1).
 */
export default class StockAvailabilityService {
  /** Map key: the same product can be requested in several units. */
  static key(productId: string, unit: string): string {
    return `${productId}:${unit}`
  }

  /**
   * Returns key(productId, unit) → available quantity in the requested
   * unit. Lots whose unit cannot be converted are ignored in the sum.
   */
  static async availabilityFor(
    householdId: string,
    requests: AvailabilityRequest[]
  ): Promise<Map<string, number>> {
    const availability = new Map<string, number>()
    if (requests.length === 0) {
      return availability
    }

    const productIds = [...new Set(requests.map((request) => request.productId))]
    const [products, lots] = await Promise.all([
      Product.query().whereIn('id', productIds),
      StockItem.query()
        .where('household_id', householdId)
        .whereIn('product_id', productIds)
        .where('status', 'available'),
    ])
    const productById = new Map(products.map((product) => [product.id, product]))

    for (const request of requests) {
      const product = productById.get(request.productId)
      let total = 0
      for (const lot of lots) {
        if (lot.productId !== request.productId) {
          continue
        }
        const converted = UnitService.convert(lot.quantity, lot.unit, request.unit, {
          unitWeightGrams: product?.unitWeightGrams,
          densityGPerMl: product?.densityGPerMl,
        })
        if (converted !== null) {
          total += converted
        }
      }
      availability.set(this.key(request.productId, request.unit), Number(total.toFixed(3)))
    }

    return availability
  }
}
