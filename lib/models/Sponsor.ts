import { Ad } from "./Ad";
import { AdStats } from "./AdStats";
import { Recipe } from "./Recipe";
import { User } from "./User";

export class Sponsor extends User{
    userId!: number;
    user!: User;
    pib!: string;
    company_name!: string;
    recipes?: Recipe[];
    ads?: Ad[];
    adStats?: AdStats[];

    isValid(): boolean {
        if(!this.userId || !this.pib || !this.company_name)
            return false;
        return true;
    }
    constructor(data: Partial<Sponsor> = {}){
        super(data);
        Object.assign(this,data);
    }
}