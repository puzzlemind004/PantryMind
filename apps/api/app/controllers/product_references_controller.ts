import type { HttpContext } from '@adonisjs/core/http'

import CatalogService from '#services/catalog_service'
import ProductReferenceTransformer from '#transformers/product_reference_transformer'
import ProductTransformer from '#transformers/product_transformer'
import { createReferenceValidator } from '#validators/catalog'

export default class ProductReferencesController {
  /**
   * Barcode lookup (spec §8.10): local catalogue first, then Open Food
   * Facts. An external hit is a proposal — nothing is persisted until
   * the user confirms (POST /product-references).
   */
  async lookupBarcode({ params, response, serialize }: HttpContext) {
    const result = await CatalogService.lookupBarcode(String(params.barcode))

    if (result.status === 'local') {
      return serialize({
        status: 'local',
        reference: ProductReferenceTransformer.transform(result.reference),
        product: ProductTransformer.transform(result.reference.product),
      })
    }

    if (result.status === 'external') {
      return serialize({ status: 'external', external: result.external })
    }

    return response.notFound({
      errors: [{ code: 'BARCODE_UNKNOWN', message: 'Barcode not found locally nor externally' }],
    })
  }

  /** Creates a commercial reference, optionally with its generic product. */
  async store({ household, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createReferenceValidator)

    if (!payload.productId && !payload.newProduct) {
      return response.unprocessableEntity({
        errors: [{ code: 'PRODUCT_REQUIRED', message: 'Provide either productId or newProduct' }],
      })
    }

    const reference = await CatalogService.createReference(household, payload)

    response.status(201)
    return serialize({
      reference: ProductReferenceTransformer.transform(reference),
      product: ProductTransformer.transform(reference.product),
    })
  }
}
