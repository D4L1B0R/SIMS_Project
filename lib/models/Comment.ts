import { ChefBeginner } from "./ChefBeginner";
import { Recipe } from "./Recipe";

export class Comment {
  id!: number;
  text!: string;
  createdAt!: Date;
  updatedAt!: Date;
  chefBeginnerId!: number;
  chefBeginner!: ChefBeginner;
  recipeId!: number;
  recipe!: Recipe;

  isValid(){
    if(!this.text || !this.chefBeginnerId || !this.recipeId)
      return false;
    return true;
  }
  constructor(data: Partial<Comment> = {}) {
    Object.assign(this, data);
  }
}