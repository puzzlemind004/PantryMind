import type { HttpContext } from '@adonisjs/core/http'

import CatalogService from '#services/catalog_service'
import ProductTransformer from '#transformers/product_transformer'
import {
  createProductValidator,
  searchProductsValidator,
  updateProductValidator,
} from '#validators/catalog'

export default class ProductsController {
  /** Products visible to the household: its own + the global catalogue. */
  async index({ household, request, serialize }: HttpContext) {
    const { search } = await request.validateUsing(searchProductsValidator)

    const products = await CatalogService.searchQuery(household, search).limit(50)

    return serialize(ProductTransformer.transform(products))
  }

  async store({ household, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)

    const product = await CatalogService.createProduct(household, payload)

    response.status(201)
    return serialize(ProductTransformer.transform(product))
  }

  async show({ household, params, response, serialize }: HttpContext) {
    const product = await CatalogService.searchQuery(household)
      .where('id', params.productId)
      .preload('references')
      .first()

    if (!product) {
      return response.notFound({
        errors: [{ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }],
      })
    }

    return serialize(ProductTransformer.transform(product))
  }

  /** Only household-owned products are editable (not the global catalogue). */
  async update({ household, params, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateProductValidator)

    const product = await CatalogService.searchQuery(household)
      .where('id', params.productId)
      .first()

    if (!product) {
      return response.notFound({
        errors: [{ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }],
      })
    }

    if (product.isGlobal) {
      return response.forbidden({
        errors: [
          { code: 'GLOBAL_PRODUCT_READONLY', message: 'Global catalogue products are read-only' },
        ],
      })
    }

    product.merge(payload)
    await product.save()

    return serialize(ProductTransformer.transform(product))
  }
}
