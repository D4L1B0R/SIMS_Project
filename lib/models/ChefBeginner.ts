import { Comment } from "./Comment";
import { Cookbook } from "./Cookbook";
import { Rating } from "./Rating";
import { Recipe } from "./Recipe";
import { User } from "./User";

export class ChefBeginner {
  id!: number;
  privileged_user!: boolean;
  userId!: number;
  user!: User; 
  recipes!: Recipe[]; 
  comments!: Comment[]; 
  ratings!: Rating[]; 
  cookbooks!: Cookbook[]; 

  isValid(){
    if(!this.privileged_user || !this.userId )
      return false;
    return true;
  }
  constructor(data: Partial<ChefBeginner> = {}) {
    Object.assign(this, data);
  }
}