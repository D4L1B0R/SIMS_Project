import { Cookbook } from "./Cookbook";
import { Recipe } from "./Recipe";

export class Bookmark {
  id!: number;
  title!: string;
  createdAt!: Date;
  updatedAt!: Date;
  recipeId!: number;
  recipe!: Recipe
  cookbookId?: number;
  cookbook?: Cookbook[];

  isValid(){
    if(!this.title || !this.cookbookId )
      return false;
    return true;
  }

  constructor(data: Partial<Bookmark> = {}) {
    Object.assign(this, data);
  }
}