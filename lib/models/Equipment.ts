import { RecipeEquipment } from "./RecipeEquipment";

export class Equipment {
  id!: number;
  name!: string;
  recipes!: RecipeEquipment[]; 

  isValid(){
    if(!this.name){
      return false;
    }
    return true;
  }
  constructor(data: Partial<Equipment> = {}) {
    Object.assign(this, data);
  }
}