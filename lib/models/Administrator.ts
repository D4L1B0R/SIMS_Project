import { Moderator } from "./Moderator";

export class Administrator extends Moderator {
  moderatorId!: number;

  isValid(): boolean {
      if(!this.moderatorId)
        return false
      return true;
  }

  constructor(data: Partial<Administrator> = {}) {
    super(data);
    Object.assign(this, data);
  }
}