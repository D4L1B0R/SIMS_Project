import { Ingredient } from "./Ingredient";
import { Recipe } from "./Recipe";

export class IngredientItem {
  id!: number;
  quantity!: number;
  measurementUnit!: string;
  recipeId!: number;
  recipe!: Recipe;
  ingredientId!: number;
  ingredient!: Ingredient;

  isValid(){
    if(!this.quantity || !this.measurementUnit || !this.recipeId || !this.ingredientId)
      return false;
    return true;
  }
  constructor(data: Partial<IngredientItem> = {}) {
    Object.assign(this, data);
  }
}