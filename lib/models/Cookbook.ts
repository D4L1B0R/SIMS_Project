import { Bookmark } from "./Bookmark";
import { ChefBeginner } from "./ChefBeginner";

export class Cookbook {
  id!: number;
  title!: string;
  description!: string;
  createdAt!: Date;
  updatedAt!: Date;
  chefBeginnerId!: number;
  chefBeginner!: ChefBeginner
  bookmarks!: Bookmark[];

  isValid(){
    if(!this.title || !this.description || !this.chefBeginnerId)
      return false;
    return true;
  }

  constructor(data: Partial<Cookbook> = {}) {
    Object.assign(this, data);
  }
}