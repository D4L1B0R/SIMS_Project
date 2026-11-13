import { Moderator } from "./Moderator";
import { Recipe } from "./Recipe";

export class RankingList{
    id!: number;
    created_at!: Date;
    updated_at!:Date;
    description!:string;
    moderatorId!:number;
    moderator!:Moderator
    recipes?:Recipe[];

    isValid(){
        if(!this.id || !this.created_at || !this.description || !this.moderator || !this.moderatorId || !this.updated_at)
            return false
        return true;
    }

    constructor(data: Partial<RankingList> = {}) {
    Object.assign(this, data);
  }
}