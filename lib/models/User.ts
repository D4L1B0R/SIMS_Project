import { ChefBeginner } from './ChefBeginner';
import { Gender } from './enums';
import { Moderator } from './Moderator';
import { Profile } from './Profile';
import { Sponsor } from './Sponsor';

export class User {
  id!: number;
  gender!: Gender;
  first_name!: string;
  last_name!: string;
  phone_number!: string;
  date_of_birth!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  Moderator?: Moderator;
  Sponsor?: Sponsor;
  profile!: Profile; 
  ChefBeginner?: ChefBeginner; 

  isValid() {
    if (this.gender !== Gender.FEMALE && this.gender !== Gender.MALE) {
      return false;
    }
    
    if (!this.date_of_birth || !this.first_name || !this.last_name || !this.phone_number) {
      return false;
    }
    
    return true;
  }

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);
  }
}