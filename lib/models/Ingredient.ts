import { IngredientItem } from "./IngredientItem";

export class Ingredient {
  id!: number;
  name!: string;
  ingredientItems!: IngredientItem[];

  isValid(){
    if(!this.name || !this.ingredientItems)
      return false;
    return true;
  }
  constructor(data: Partial<Ingredient> = {}) {
    Object.assign(this, data);
  }
}