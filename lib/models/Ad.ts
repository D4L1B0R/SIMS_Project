import { AdStats } from "./AdStats";
import { Sponsor } from "./Sponsor";

export class Ad{
    id!: number;
    resource_url!: string;
    description!: string;
    sponsorId!:number;
    sponsor!:Sponsor;
    adStatsId!:number;
    adStats!:AdStats;
    
    isValid(){
        if(!this.resource_url || !this.description || !this.sponsorId)
            return false;
        return true;
    }

    constructor(data:Partial<Ad>={}){
        Object.assign(this,data);
    }
}