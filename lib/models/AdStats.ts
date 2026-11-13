import { Ad } from "./Ad";
import { Recipe } from "./Recipe";
import { Sponsor } from "./Sponsor";

export class AdStats{
    id!: number;
    ad_costs!: number;
    number_of_views!:number;
    revenue!: number;
    sponsorId!:number;
    sponsor!: Sponsor;
    ad?:Ad;
    recipes?: Recipe[];

    isValid(){
        if(!this.id || !this.ad_costs || !this.number_of_views || !this.revenue || !this.sponsorId)
            return false;
        return true;
    }
    constructor(data: Partial<AdStats>={}){
        Object.assign(this,data);
    }
}