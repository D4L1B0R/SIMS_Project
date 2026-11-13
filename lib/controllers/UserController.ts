import { GenericController } from './GenericController';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';
import { BookmarkDTO, ChefBeginnerDTO, CookbookDTO, ModeratorDTO, RankingListDTO, SponsorDTO, UserDTO } from '../dtos'; 
import { RecipeDTO } from '../dtos';
import { RecipeRepository } from '../repositories/RecipeRepository';
import { Recipe } from '../models/Recipe';
import { Profile } from '../models/Profile';
import { ChefBeginner } from '../models/ChefBeginner';
import { Moderator } from '../models/Moderator';
import { Administrator } from '../models/Administrator';
import { PreparationStep } from '../models/PreparationStep';
import { IngredientItem } from '../models/IngredientItem';
import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { RatingRepository } from '../repositories/RatingRepository';
import { CommentRepository } from '../repositories/CommentRepository';
import { Sponsor } from '../models/Sponsor'; 
import { Bookmark } from '../models/Bookmark';
import { Cookbook } from '../models/Cookbook';
import { RankingList } from '../models/RankingList';
import { RankingListRepository } from '../repositories/RankingRepository';

export class UserController extends GenericController<User, UserDTO> {
  private recipeRepository: RecipeRepository;
  private bookmarkRepository: BookmarkRepository;
  private ratingRepository: RatingRepository;
  private commentRepository: CommentRepository;
  private rankingListRepository: RankingListRepository;
  constructor() {
    super(new UserRepository());
    this.recipeRepository = new RecipeRepository();
    this.bookmarkRepository = new BookmarkRepository();
    this.ratingRepository = new RatingRepository();
    this.commentRepository = new CommentRepository();
    this.rankingListRepository = new RankingListRepository();
  }

  
  translateRankingListDTO(dto: RankingListDTO): RankingList {
    return new RankingList({
      id: dto.id,
      created_at: dto.created_at,
      updated_at: dto.updated_At,
      description: dto.description,
      moderatorId: dto.moderatorId,
      moderator: dto.moderator
        ? new Moderator({
            id: dto.moderator.id,
            userId: dto.moderator.userId
          })
        : undefined,
      recipes: dto.recipes?.map(
        (r) =>
          new Recipe({
            id: r.id,
            title: r.title,
            preparation_time: r.preparation_time,
            heaviness: r.heaviness,
            category: r.category,
            number_of_views: r.number_of_views,
            number_of_portions: r.number_of_portions,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            chefBeginnerId: r.chefBeginnerId
          })
      )
    });
  }

  private mapRecipeToSimpleDTO(recipe: Recipe): any {
    const mapChefBeginnerToSimpleDTO = (chefBeginner: ChefBeginner): any => ({
      id: chefBeginner.id,
      userId: chefBeginner.userId,
      user: chefBeginner.user ? {
        id: chefBeginner.user.id,
        first_name: chefBeginner.user.first_name,
        last_name: chefBeginner.user.last_name
      } : undefined
    });

    return {
      id: recipe.id,
      title: recipe.title,
      preparation_time: recipe.preparation_time,
      heaviness: recipe.heaviness,
      category: recipe.category,
      number_of_views: recipe.number_of_views,
      number_of_portions: recipe.number_of_portions,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      chefBeginnerId: recipe.chefBeginnerId,
      chefBeginner: recipe.chefBeginner ? mapChefBeginnerToSimpleDTO(recipe.chefBeginner) : undefined
    };
  }
  private mapBookmarkToDTO(bookmark:Bookmark):BookmarkDTO {
    let recipeDTO: RecipeDTO | undefined = undefined;
    if(bookmark.recipe){
      recipeDTO = this.mapRecipeToSimpleDTO(bookmark.recipe);
    }

    return {
      id:bookmark.id,
      title:bookmark.title,
      recipeId:bookmark.recipeId,
      cookbookId: bookmark.cookbookId || 0,
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt,
      recipe:recipeDTO,
      cookbook:undefined
    }
  }
  private mapCookbookToDTO(cookbook: Cookbook): CookbookDTO {
    const mapBookmarkToDTO = (bookmark: Bookmark): BookmarkDTO => {
      let recipeDTO: RecipeDTO | undefined = undefined;
      if (bookmark.recipe) {
        recipeDTO = this.mapRecipeToSimpleDTO(bookmark.recipe);
      }

      return {
        id: bookmark.id,
        title: bookmark.title,
        recipeId: bookmark.recipeId,
        cookbookId: bookmark.cookbookId || 0,
        createdAt: bookmark.createdAt,
        updatedAt: bookmark.updatedAt,
        recipe: recipeDTO,
        cookbook: undefined
      };
    };

    const mapChefBeginnerToSimpleDTO = (chefBeginner: ChefBeginner): any => ({
      id: chefBeginner.id,
      userId: chefBeginner.userId,
      user: chefBeginner.user ? {
        id: chefBeginner.user.id,
        first_name: chefBeginner.user.first_name,
        last_name: chefBeginner.user.last_name
      } : undefined
    });

    return {
      id: cookbook.id,
      title: cookbook.title,
      description: cookbook.description || undefined,
      chefBeginnerId: cookbook.chefBeginnerId,
      chefBeginner: cookbook.chefBeginner ? mapChefBeginnerToSimpleDTO(cookbook.chefBeginner) : undefined,
      bookmarks: cookbook.bookmarks ? cookbook.bookmarks.map(mapBookmarkToDTO) : []
    };
  }
  translateDTO(dto: UserDTO): User {
    return new User({
      id: dto.id,
      gender: dto.gender,
      first_name: dto.first_name,
      last_name: dto.last_name,
      phone_number: dto.phone_number,
      date_of_birth: dto.date_of_birth,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      profile: dto.profile ? new Profile({
        id: dto.profile.id,
        email: dto.profile.email,
        password: dto.profile.password,
        userId: dto.profile.userId
      }) : undefined,
      ChefBeginner: dto.chefBeginner ? new ChefBeginner({
        id: dto.chefBeginner.id,
        privileged_user: dto.chefBeginner.privileged_user,
        userId: dto.chefBeginner.userId
      }) : undefined,
      Moderator: dto.moderator ? new Moderator({
        id: dto.moderator.id,
        userId: dto.moderator.userId,
        Administrator: dto.moderator.administrator ? new Administrator({
          id: dto.moderator.administrator.id,
          moderatorId: dto.moderator.administrator.moderatorId
        }) : undefined
      }) : undefined,
      Sponsor: dto.sponsor ? new Sponsor({
        id: dto.sponsor.id,
        userId: dto.sponsor.userId,
        pib: dto.sponsor.pib,
        company_name: dto.sponsor.company_name
      }) : undefined
    });
  }
  translateModel(model: User): UserDTO {
    const baseUserProperties = {
      id: model.id,
      gender: model.gender,
      first_name: model.first_name,
      last_name: model.last_name,
      phone_number: model.phone_number,
      date_of_birth: model.date_of_birth,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    };

    const mapProfileToDTO = (profile: Profile) => ({
      id: profile.id,
      email: profile.email,
      password: profile.password,
      userId: profile.userId
    });

    const mapChefBeginnerToDTO = (chef: ChefBeginner) => ({
      ...baseUserProperties,
      id: chef.id,
      privileged_user: chef.privileged_user,
      userId: chef.userId
    });

    const mapSponsorToDTO = (sponsor: Sponsor): SponsorDTO => ({
      ...baseUserProperties,
      userId: sponsor.userId,
      pib: sponsor.pib,
      company_name: sponsor.company_name,
      user: { ...baseUserProperties },
      recipes: [],
      ads: [],
      adStats: []
    });

    const mapAdministratorToDTO = (administrator: Administrator) => ({
      ...baseUserProperties,
      userId: administrator.userId,
      moderatorId: administrator.moderatorId
    });

    const mapModeratorToDTO = (moderator: Moderator): ModeratorDTO => ({
      ...baseUserProperties,
      userId: moderator.userId,
      administrator: moderator.Administrator ? mapAdministratorToDTO(moderator.Administrator) : undefined,
      recipes: [],
      rankingLists: []
    });

    const userDTO: UserDTO = {
      ...baseUserProperties,
      profile: model.profile ? mapProfileToDTO(model.profile) : undefined,
      chefBeginner: model.ChefBeginner ? mapChefBeginnerToDTO(model.ChefBeginner) : undefined,
      sponsor: model.Sponsor ? mapSponsorToDTO(model.Sponsor) : undefined,
      moderator: model.Moderator ? mapModeratorToDTO(model.Moderator) : undefined
    };

    return userDTO;
  }
  verifyDTO(dto: UserDTO): boolean {
    const user = this.translateDTO(dto);
    return user.isValid();
  }

  async addUser(userDTO: UserDTO): Promise<void> {
    if (!this.verifyDTO(userDTO)) {
      throw new Error('Invalid user data');
    }
    
    const user = this.translateDTO(userDTO);
    await (this.repository as UserRepository).add(user);
  }

  async updateUser(userDTO: UserDTO): Promise<void> {
    if (!this.verifyDTO(userDTO)) {
      throw new Error('Invalid user data');
    }
    
    const user = this.translateDTO(userDTO);
    await (this.repository as UserRepository).update(user);
  }

  async deleteUser(id: number): Promise<void> {
    const existingUser = await this.repository.getById(id);
    if (!existingUser) {
      throw new Error('Korisnik nije pronađen');
    }

    await this.repository.delete(id);
  }

  async loginUser(email: string, password: string): Promise<UserDTO | null> {
    const users = await (this.repository as UserRepository).findByExpression({
      profile: {
        email: email
      }
    });
    
    if (users.length === 0 || !users[0].profile) {
      return null;
    }

    if (users[0].profile.password !== password) {
      return null;
    }
    
    return this.translateModel(users[0]);
  }

  async getUserRecipes(userId: number): Promise<RecipeDTO[]> {
    const user = await this.repository.getById(userId);
    if (!user || !user.ChefBeginner) {
      return [];
    }

    const recipes = await this.recipeRepository.findByChef(user.ChefBeginner.id);
    return recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      preparation_time: recipe.preparation_time,
      heaviness: recipe.heaviness,
      category: recipe.category,
      number_of_views: recipe.number_of_views,
      number_of_portions: recipe.number_of_portions,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      chefBeginnerId: recipe.chefBeginnerId
    } as RecipeDTO));
  }

  async getUserBookmarks(userId: number): Promise<any[]> {
    const bookmarks = await this.bookmarkRepository.findByChefBeginnerId(userId);
    return bookmarks;
  }

  async getUserRatings(userId: number): Promise<any[]> {
    const ratings = await this.ratingRepository.findByChefBeginnerId(userId);
    return ratings;
  }

  async getUserComments(userId: number): Promise<any[]> {
    const comments = await this.commentRepository.findByChefBeginnerId(userId);
    return comments;
  }

  async addRecipe(recipeDTO: RecipeDTO): Promise<void> {
    const preparationSteps = recipeDTO.preparationSteps?.map(step => 
      new PreparationStep({
        stepNumber: step.stepNumber,
        description: step.description,
        recipeId: step.recipeId
      })
    );

    const ingredientItems = recipeDTO.ingredientItems?.map(item =>
      new IngredientItem({
        quantity: item.quantity,
        measurementUnit: item.measurementUnit,
        recipeId: item.recipeId,
        ingredientId: item.ingredientId
      })
    );

    const recipe = new Recipe({
      title: recipeDTO.title,
      preparation_time: recipeDTO.preparation_time,
      heaviness: recipeDTO.heaviness,
      category: recipeDTO.category,
      number_of_portions: recipeDTO.number_of_portions,
      chefBeginnerId: recipeDTO.chefBeginnerId,
      preparationSteps: preparationSteps,
      ingredientItems: ingredientItems
    });
    
    if (!recipe.isValid()) {
      throw new Error('Invalid recipe data');
    }
    
    await this.recipeRepository.add(recipe);
  }

  async setToModerator(userId: number): Promise<void> {
    await (this.repository as UserRepository).setToModerator(userId);
  }

  async setToAdmin(userId: number): Promise<void> {
    await (this.repository as UserRepository).setToAdmin(userId);
  }

  async setToChefBeginner(userId: number, privileged_user: boolean = false): Promise<void> {
    await (this.repository as UserRepository).setToChefBeginner(userId, privileged_user);
  }

  async setToSponsor(userId: number, pib: string, company_name: string): Promise<void> {
    await (this.repository as UserRepository).setToSponsor(userId, pib, company_name);
  }

  async isAdmin(userId: number): Promise<boolean> {
    return await (this.repository as UserRepository).isAdmin(userId);
  }

  async getUserCookbooksWithRecipes(userId: number): Promise<CookbookDTO[]> {
    try {
      const user = await this.repository.getById(userId);
      if (!user) {
        throw new Error('Korisnik nije pronađen');
      }

      if (!user.ChefBeginner) {
        return [];
      }

      const cookbooks = await this.bookmarkRepository.getCookbooksByChefBeginnerId(user.ChefBeginner.id);
      
      return cookbooks.map(cookbook => this.mapCookbookToDTO(cookbook));
    } catch (error) {
      console.error('Greška pri dobavljanju cookbookova:', error);
      throw error;
    }
  }

  // async getCurrentUserCookbooksWithRecipes(): Promise<CookbookDTO[]> {
  //   try {
  //     const sessionUser = await this.getCurrentSessionUser();
  //     if (!sessionUser) {
  //       throw new Error('Niste prijavljeni');
  //     }

  //     return await this.getUserCookbooksWithRecipes(sessionUser.id);
  //   } catch (error) {
  //     console.error('Greška pri dobavljanju cookbookova:', error);
  //     throw error;
  //   }
  // }

  async getUserCookbookWithRecipes(userId: number, cookbookId: number): Promise<CookbookDTO | null> {
    try {
      const user = await this.repository.getById(userId);
      if (!user || !user.ChefBeginner) {
        return null;
      }

      const cookbook = await this.bookmarkRepository.getCookbookById(cookbookId);
      
      if (!cookbook || cookbook.chefBeginnerId !== user.ChefBeginner.id) {
        return null;
      }

      return this.mapCookbookToDTO(cookbook);
    } catch (error) {
      console.error('Greška pri dobavljanju cookbooka:', error);
      throw error;
    }
  }

  async createUserCookbook(userId: number, cookbookData: { title: string; description?: string }): Promise<CookbookDTO> {
    try {
      const user = await this.repository.getById(userId);
      if (!user || !user.ChefBeginner) {
        throw new Error('Korisnik nije kuvar ili nije pronađen');
      }

      const cookbook = await this.bookmarkRepository.createCookbook({
        ...cookbookData,
        description: cookbookData.description || ' ',
        chefBeginnerId: user.ChefBeginner.id
      });

      return this.mapCookbookToDTO(cookbook);
    } catch (error) {
      console.error('Greška pri kreiranju cookbooka:', error);
      throw error;
    }
  }

  async updateUserCookbook(userId: number, cookbookId: number, updates: { title?: string; description?: string }): Promise<CookbookDTO> {
    try {
      const user = await this.repository.getById(userId);
      if (!user || !user.ChefBeginner) {
        throw new Error('Korisnik nije kuvar ili nije pronađen');
      }

      const existingCookbook = await this.bookmarkRepository.getCookbookById(cookbookId);
      if (!existingCookbook || existingCookbook.chefBeginnerId !== user.ChefBeginner.id) {
        throw new Error('Cookbook ne pripada korisniku ili nije pronađen');
      }

      const updatedCookbook = await this.bookmarkRepository.updateCookbook(cookbookId, updates);
      return this.mapCookbookToDTO(updatedCookbook);
    } catch (error) {
      console.error('Greška pri ažuriranju cookbooka:', error);
      throw error;
    }
  }

  async deleteUserCookbook(userId: number, cookbookId: number): Promise<void> {
    try {
      const user = await this.repository.getById(userId);
      if (!user || !user.ChefBeginner) {
        throw new Error('Korisnik nije kuvar ili nije pronađen');
      }

      const existingCookbook = await this.bookmarkRepository.getCookbookById(cookbookId);
      if (!existingCookbook || existingCookbook.chefBeginnerId !== user.ChefBeginner.id) {
        throw new Error('Cookbook ne pripada korisniku ili nije pronađen');
      }

      await this.bookmarkRepository.deleteCookbook(cookbookId);
    } catch (error) {
      console.error('Greška pri brisanju cookbooka:', error);
      throw error;
    }
  }
  async getBookmarksByCookbook(cookbookId: number): Promise<BookmarkDTO[]> {
    try {
      const bookmarkRepository = new BookmarkRepository();
      const bookmarks = await bookmarkRepository.getBookmarksByCookbook(cookbookId);
      
      return bookmarks.map(bookmark => this.mapBookmarkToDTO(bookmark));
    } catch (error) {
      console.error('Greška pri dobijanju bookmarkova:', error);
      throw error;
    }
  }
  async deleteBookmarkFromCookbook(userId: number, cookbookId: number, bookmarkId: number): Promise<void> {
    try {
      const user = await this.repository.getById(userId);
      if (!user || !user.ChefBeginner) {
        throw new Error('Korisnik nije kuvar ili nije pronađen');
      }

      const cookbook = await this.bookmarkRepository.getCookbookById(cookbookId);
      if (!cookbook || cookbook.chefBeginnerId !== user.ChefBeginner.id) {
        throw new Error('Cookbook ne pripada korisniku ili nije pronađen');
      }

      const bookmark = await this.bookmarkRepository.getById(bookmarkId);
      if (!bookmark || bookmark.cookbookId !== cookbookId) {
        throw new Error('Bookmark ne pripada cookbooku ili nije pronađen');
      }

      await this.bookmarkRepository.delete(bookmarkId);
    } catch (error) {
      console.error('Greška pri brisanju bookmarka:', error);
      throw error;
    }
  }

  async addRankingList(dto: RankingListDTO): Promise<void> {
    return await (this.rankingListRepository.add(this.translateRankingListDTO(dto)))
  }

  async getAllRankingLists(moderatorId?: number): Promise<RankingList[]> {
  if (moderatorId) {
    return await this.rankingListRepository.getAllMod(moderatorId);
  } else {
    return await this.rankingListRepository.getAll();
  }
}

  async getRankingListById(id: number): Promise<RankingList | null> {
    return await this.rankingListRepository.getById(id);
  }

  async addRecipeToRankinList(id: number, recipeIds: number[]): Promise<void> {
    return await this.rankingListRepository.addRecipes(id, recipeIds);
  }

  async updateRankingList(id: number, data: any): Promise<void> {
    return await this.rankingListRepository.updateList(id, data);
  }
  
  async deleteRankingList(id: number) {
    return await this.rankingListRepository.delete(id);
  }

  async deleteRecipeFromRankingList(id: number, recipeId: number) {
    return await this.rankingListRepository.deleteRecipe(id, recipeId);
  }
  
}