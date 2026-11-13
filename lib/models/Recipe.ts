import { AdStats } from './AdStats';
import { Bookmark } from './Bookmark';
import { ChefBeginner } from './ChefBeginner';
import { Comment } from './Comment';
import { Heaviness, Category} from './enums';
import { IngredientItem } from './IngredientItem';
import { Moderator } from './Moderator';
import { PreparationStep } from './PreparationStep';
import { RankingList } from './RankingList';
import { Rating } from './Rating';
import { RecipeEquipment } from './RecipeEquipment';
import { Sponsor } from './Sponsor';

export class Recipe {
  id!: number;
  title!: string;
  preparation_time!: number;
  heaviness!: Heaviness;
  category!: Category;
  number_of_views!: number;
  number_of_portions!: number;
  createdAt!: Date;
  updatedAt!: Date;

  chefBeginnerId!: number;
  chefBeginner!: ChefBeginner; 
  preparationSteps!: PreparationStep[]; 
  equipment!: RecipeEquipment[]; 
  ingredientItems!: IngredientItem[]; 
  ratings!: Rating[]; 
  comments!: Comment[]; 
  bookmarks!: Bookmark[]; 

  moderators?: Moderator[];
  rankingLists?: RankingList[];
  sponsors?:Sponsor[];
  adStats?: AdStats[];

  isValid(){
    if(!this.title || !this.preparation_time || !this.preparationSteps || !this.heaviness ||  !this.category || !this.number_of_portions || !this.chefBeginnerId  ||  !this.ingredientItems) // biznis logika da mora da ima makar 1 ingdtiem i repstep
      return false;
    if(![Category.BREAKFAST, Category.LUNCH, Category.DINNER, Category.SNACK, Category.DESSERT, Category.DRINK].includes(this.category))
      return false;
    return true;
  }

  getChefBeginner(){
    return this.chefBeginnerId
  }
  getUserId(){
    return this.chefBeginner?.userId || this.chefBeginnerId;
  }

  getChefName(){
    if (this.chefBeginner?.user) {
      return `${this.chefBeginner.user.first_name} ${this.chefBeginner.user.last_name}`;
    }
    return 'Nepoznat kuvar';
  }
  constructor(data: Partial<Recipe> = {}) {
    Object.assign(this, data);
  }
}