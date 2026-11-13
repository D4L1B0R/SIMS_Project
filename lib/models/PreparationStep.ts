import { Recipe } from "./Recipe";

export class PreparationStep {
  id!: number;
  stepNumber!: number;
  description!: string;
  recipeId!: number;
  recipe!: Recipe; 

  isValid(){
    if(!this.stepNumber || !this.description ||this.recipeId)
      return false;
    return true;
  }
  constructor(data: Partial<PreparationStep> = {}) {
    Object.assign(this, data);
  }
}