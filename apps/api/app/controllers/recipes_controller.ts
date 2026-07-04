import type { HttpContext } from '@adonisjs/core/http'

import ActivityLogService from '#services/activity_log_service'
import RecipeService from '#services/recipe_service'
import RecipeTransformer from '#transformers/recipe_transformer'
import {
  createRecipeValidator,
  feasibilityValidator,
  listRecipesValidator,
  updateRecipeValidator,
} from '#validators/recipe'

export default class RecipesController {
  /** Recipe list with filters: text, tag, total time (spec §6.3). */
  async index({ household, request, serialize }: HttpContext) {
    const filters = await request.validateUsing(listRecipesValidator)

    const query = RecipeService.baseQuery(household)
      .preload('ingredients', (ingredientQuery) =>
        ingredientQuery.preload('product').orderBy('position')
      )
      .orderBy('name', 'asc')

    if (filters.search) {
      query.whereILike('name', `%${filters.search}%`)
    }
    if (filters.tag) {
      query.whereRaw('tags @> ?', [JSON.stringify([filters.tag])])
    }
    if (filters.maxMinutes !== undefined) {
      query.whereRaw('coalesce(prep_minutes, 0) + coalesce(cook_minutes, 0) <= ?', [
        filters.maxMinutes,
      ])
    }

    return serialize(RecipeTransformer.transform(await query))
  }

  async store({ household, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createRecipeValidator)

    const recipe = await RecipeService.create(household, payload)

    await ActivityLogService.record({
      householdId: household.id,
      userId: auth.getUserOrFail().id,
      action: 'recipe.created',
      subjectType: 'recipe',
      subjectId: recipe.id,
      data: { name: recipe.name },
    })

    response.status(201)
    return serialize(RecipeTransformer.transform(recipe))
  }

  async show({ household, params, response, serialize }: HttpContext) {
    const recipe = await RecipeService.baseQuery(household)
      .where('id', params.recipeId)
      .preload('ingredients', (query) =>
        query
          .preload('product')
          .preload('substitutes', (sub) => sub.preload('product'))
          .orderBy('position')
      )
      .first()

    if (!recipe) {
      return response.notFound({
        errors: [{ code: 'RECIPE_NOT_FOUND', message: 'Recipe not found' }],
      })
    }

    return serialize(RecipeTransformer.transform(recipe))
  }

  async update({ household, params, auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateRecipeValidator)

    const recipe = await RecipeService.baseQuery(household).where('id', params.recipeId).first()
    if (!recipe) {
      return response.notFound({
        errors: [{ code: 'RECIPE_NOT_FOUND', message: 'Recipe not found' }],
      })
    }

    await RecipeService.update(recipe, household, payload)

    await ActivityLogService.record({
      householdId: household.id,
      userId: auth.getUserOrFail().id,
      action: 'recipe.updated',
      subjectType: 'recipe',
      subjectId: recipe.id,
      data: { name: recipe.name },
    })

    return serialize(RecipeTransformer.transform(recipe))
  }

  /** Soft delete (spec 7.16): planned meals keep their snapshots. */
  async destroy({ household, params, auth, response }: HttpContext) {
    const recipe = await RecipeService.baseQuery(household).where('id', params.recipeId).first()
    if (!recipe) {
      return response.notFound({
        errors: [{ code: 'RECIPE_NOT_FOUND', message: 'Recipe not found' }],
      })
    }

    await RecipeService.softDelete(recipe)

    await ActivityLogService.record({
      householdId: household.id,
      userId: auth.getUserOrFail().id,
      action: 'recipe.deleted',
      subjectType: 'recipe',
      subjectId: recipe.id,
      data: { name: recipe.name },
    })

    return response.noContent()
  }

  async duplicate({ household, params, response, serialize }: HttpContext) {
    const recipe = await RecipeService.baseQuery(household).where('id', params.recipeId).first()
    if (!recipe) {
      return response.notFound({
        errors: [{ code: 'RECIPE_NOT_FOUND', message: 'Recipe not found' }],
      })
    }

    const copy = await RecipeService.duplicate(recipe, household)

    response.status(201)
    return serialize(RecipeTransformer.transform(copy))
  }

  /** Feasibility against current stock (spec §8.7), servings-adjustable. */
  async feasibility({ household, params, request, response, serialize }: HttpContext) {
    const { servings } = await request.validateUsing(feasibilityValidator)

    const recipe = await RecipeService.baseQuery(household).where('id', params.recipeId).first()
    if (!recipe) {
      return response.notFound({
        errors: [{ code: 'RECIPE_NOT_FOUND', message: 'Recipe not found' }],
      })
    }

    return serialize(await RecipeService.feasibility(recipe, household, servings))
  }
}
