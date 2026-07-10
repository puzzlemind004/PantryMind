import { CiqualFoodSchema } from '#database/schema'
import { withUuidPrimaryKey } from '#models/mixins/with_uuid'
import type { NutritionPer100 } from '#types/catalog'

/** One entry of the ANSES CIQUAL composition table (global reference data). */
export default class CiqualFood extends withUuidPrimaryKey(CiqualFoodSchema) {
  declare nutritionPer100: NutritionPer100
}
