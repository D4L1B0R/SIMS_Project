import { Equipment } from "./Equipment";
import { Recipe } from "./Recipe";

export class RecipeEquipment {
  recipeId!: number;
  equipmentId!: number;
  recipe!: Recipe; 
  equipment!: Equipment; 

  isValid(){
    if(!this.recipeId || !this.equipmentId)
      return false;
    return true;
  }
  constructor(data: Partial<RecipeEquipment> = {}) {
    Object.assign(this, data);
  }
}