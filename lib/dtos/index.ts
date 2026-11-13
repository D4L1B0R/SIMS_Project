import { Category, Heaviness, Gender } from "../models/enums";

export interface UserDTO {
  id: number;
  gender: Gender;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: Date;
  createdAt?: Date;
  updatedAt?: Date;
  profile?: ProfileDTO;
  chefBeginner?: ChefBeginnerDTO;
  sponsor?: SponsorDTO;
  moderator?: ModeratorDTO;
}

export interface ProfileDTO {
  id: number;
  email: string;
  password: string;
  userId: number;
  user?: UserDTO;
}

export interface ChefBeginnerDTO {
  id: number;
  privileged_user: boolean;
  userId: number;
  user?: UserDTO;
  recipes?: RecipeDTO[];
  comments?: CommentDTO[];
  ratings?: RatingDTO[];
  cookbooks?: CookbookDTO[];
}
export interface RecipeDTO {
  id: number;
  title: string;
  preparation_time: number;
  heaviness: Heaviness;
  category: Category;
  number_of_views: number;
  number_of_portions: number;
  createdAt: Date;
  updatedAt: Date;
  chefBeginnerId: number;
  chefBeginner?: ChefBeginnerDTO;
  preparationSteps?: PreparationStepDTO[];
  ingredientItems?: IngredientItemDTO[];
  equipment?: RecipeEquipmentDTO[];
  ratings?: RatingDTO[];
  comments?: CommentDTO[];
  bookmarks?: BookmarkDTO[];
  moderators?:ModeratorDTO[];
  rankingLists?:RankingListDTO[];
  sponsors?:SponsorDTO[];
  adStats?:AdStatsDTO[];
}
export interface IngredientItemDTO {
  id: number;
  quantity: number;
  measurementUnit: string;
  recipeId: number;
  recipe?: RecipeDTO;
  ingredientId: number;
  ingredient?: IngredientDTO;
}

export interface RecipeEquipmentDTO {
  recipeId: number;
  equipmentId: number;
  recipe?: RecipeDTO;
  equipment?: EquipmentDTO;
}

export interface EquipmentDTO {
  id: number;
  name: string;
  recipeEquipments?: RecipeEquipmentDTO[];
}

export interface IngredientDTO {
  id: number;
  name: string;
  ingredientItems?: IngredientItemDTO[];
}

export interface PreparationStepDTO {
  id: number;
  stepNumber: number;
  description: string;
  recipeId: number;
  recipe?: RecipeDTO;
}

export interface CommentDTO {
  id: number;
  text: string;
  rating?: number;
  createdAt: Date;
  updatedAt?: Date;
  chefBeginnerId: number;
  recipeId: number;
  chefBeginner?: ChefBeginnerDTO;
  recipe?: RecipeDTO;
}

export interface RatingDTO {
  id: number;
  value: number;
  createdAt: Date;
  updatedAt?: Date;
  chefBeginnerId: number;
  recipeId: number;
  chefBeginner?: ChefBeginnerDTO;
  recipe?: RecipeDTO;
}

export interface CookbookDTO {
  id: number;
  title: string;
  description?: string;
  chefBeginnerId: number;
  chefBeginner?: ChefBeginnerDTO;
  bookmarks?: BookmarkDTO[];
}

export interface BookmarkDTO {
  id: number;
  title: string;
  recipeId: number;
  cookbookId: number;
  recipe?: RecipeDTO;
  cookbook?: CookbookDTO[];
  createdAt: Date;
  updatedAt?: Date;
}
export interface ModeratorDTO extends UserDTO {
  userId: number;
  recipes?: RecipeDTO[];
  rankingLists?: RankingListDTO[];
  administrator?: AdministratorDTO;
}
export interface AdministratorDTO extends ModeratorDTO {
  moderatorId: number;
}
export interface SponsorDTO extends UserDTO {
  userId: number;
  user: UserDTO;
  pib: string;
  company_name: string;
  recipes?: RecipeDTO[];
  ads?: AdDTO[];
  adStats?: AdStatsDTO[];
}
export interface RankingListDTO{
  id:number;
  created_at: Date;
  updated_At:Date;
  description:string;
  moderatorId:number;
  moderator:ModeratorDTO;
  recipes?:RecipeDTO[];
}
export interface AdDTO {
  id?: number;
  resource_url: string;
  description: string;
  sponsorId: number;
  sponsor?: SponsorDTO;
  adStatsId?: number;
  adStats?: AdStatsDTO;
}

export interface AdStatsDTO {
  id?: number;
  ad_costs: number;
  number_of_views: number;
  revenue: number;
  sponsorId: number;
  sponsor?: SponsorDTO;
  ad?: AdDTO;
  recipes?: RecipeDTO[];
}


export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  firstName?: string;
  lastName?: string;
  chefBeginnerId?: number;
  moderator?: {
    id: number;
    userId: number;
    administrator?: {
      moderatorId: number;
    } | null;
  } | null;
  isAdmin?: boolean;
  isModerator?: boolean;
  privileged_user?: boolean
  isSponsor?: boolean
}