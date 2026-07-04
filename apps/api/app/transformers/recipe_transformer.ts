import type Recipe from '#models/recipe'
import { BaseTransformer } from '@adonisjs/core/transformers'

import RecipeIngredientTransformer from '#transformers/recipe_ingredient_transformer'

export default class RecipeTransformer extends BaseTransformer<Recipe> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'householdId',
        'name',
        'description',
        'servings',
        'prepMinutes',
        'cookMinutes',
        'steps',
        'tags',
        'imageUrl',
        'createdAt',
        'updatedAt',
      ]),
      ingredients: RecipeIngredientTransformer.transform(
        this.whenLoaded(this.resource.ingredients)
      ),
    }
  }
}
