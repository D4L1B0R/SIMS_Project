import { ChefBeginner } from "./ChefBeginner";
import { Recipe } from "./Recipe";

export class Rating {
  id!: number;
  value!: number;
  createdAt!: Date;
  updatedAt!: Date;
  chefBeginnerId!: number;
  chefBeginner!:ChefBeginner
  recipeId!: number;
  recipe!: Recipe

  isValid(){
    if(!this.value || !this.chefBeginnerId || !this.recipeId )
      return false;
    return this.value >= 1 && this.value <= 5;
  }
  constructor(data: Partial<Rating> = {}) {
    Object.assign(this, data);
  }
}