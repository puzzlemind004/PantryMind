import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

import CiqualFood from '#models/ciqual_food'
import Product from '#models/product'
import CiqualService from '#services/ciqual_service'
import ProductTransformer from '#transformers/product_transformer'

export const ciqualSearchValidator = vine.create({
  search: vine.string().trim().minLength(2).maxLength(100),
})

export const linkCiqualValidator = vine.create({
  ciqualCode: vine.string().trim().maxLength(16),
})

/** CIQUAL enrichment of generic products (décision projet : OFF + CIQUAL). */
export default class CiqualController {
  async search({ request, serialize }: HttpContext) {
    const { search } = await request.validateUsing(ciqualSearchValidator)

    const foods = await CiqualService.search(search)
    return serialize({
      foods: foods.map((food) => ({
        code: food.code,
        name: food.name,
        nutritionPer100: food.nutritionPer100,
      })),
    })
  }

  /** Copies the CIQUAL nutrition into a household product. */
  async link({ household, params, request, response, serialize }: HttpContext) {
    const { ciqualCode } = await request.validateUsing(linkCiqualValidator)

    const product = await Product.query()
      .where('id', params.productId)
      .where('household_id', household.id)
      .first()
    if (!product) {
      return response.notFound({
        errors: [
          {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Produit inconnu ou non modifiable (catalogue global)',
          },
        ],
      })
    }

    const food = await CiqualFood.query().where('code', ciqualCode).first()
    if (!food) {
      return response.unprocessableEntity({
        errors: [{ code: 'CIQUAL_NOT_FOUND', message: 'Code CIQUAL inconnu' }],
      })
    }

    product.ciqualCode = food.code
    product.nutritionPer100 = food.nutritionPer100
    await product.save()

    return serialize(ProductTransformer.transform(product))
  }
}
