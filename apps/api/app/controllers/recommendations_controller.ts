import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

import RecommendationService from '#services/recommendation_service'

export const recommendationsValidator = vine.create({
  limit: vine.number().min(1).max(30).optional(),
})

/** Suggestions only — the user always decides (spec §6.7, §8.12). */
export default class RecommendationsController {
  async index({ household, request, serialize }: HttpContext) {
    const { limit } = await request.validateUsing(recommendationsValidator)

    return serialize({
      recommendations: await RecommendationService.suggest(household, { limit }),
    })
  }
}
