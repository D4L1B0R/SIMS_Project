import { User } from "./User";

export class Profile {
  id!: number;
  email!: string;
  password!: string;
  userId!: number;
  user!: User;

  isValid(){

    if(!this.email || !this.password || !this.userId)
      return false;

    return true;
  }
  constructor(data: Partial<Profile> = {}) {
    Object.assign(this, data);
  }
}