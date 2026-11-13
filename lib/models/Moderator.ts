import { Administrator } from "./Administrator";
import { RankingList } from "./RankingList";
import { Recipe } from "./Recipe";
import { User } from "./User";

export class Moderator extends User {
  userId!: number;
  recipes?: Recipe[];
  rankingLists?: RankingList[];
  Administrator?: Administrator;

  isValid(): boolean {
      if(!this.userId)
        return false
      return true;
  }

  constructor(data: Partial<Moderator> = {}) {
    super(data);
    Object.assign(this, data);
  }
}
