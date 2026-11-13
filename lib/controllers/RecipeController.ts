import { GenericController } from './GenericController';
import { RecipeRepository } from '../repositories/RecipeRepository';
import { Recipe } from '../models/Recipe';
import { RecipeDTO, CommentDTO, RatingDTO, BookmarkDTO, SessionUser } from '../dtos';
import { PreparationStep } from '../models/PreparationStep';
import { IngredientItem } from '../models/IngredientItem';
import { Rating } from '../models/Rating';
import { Comment } from '../models/Comment';
import { Category, Heaviness } from '../models/enums';
import { RatingRepository } from '../repositories/RatingRepository';
import { CommentRepository } from '../repositories/CommentRepository';
import { BookmarkRepository } from '../repositories/BookmarkRepository';
import { Cookbook } from '../models/Cookbook';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { Bookmark } from '../models/Bookmark';
import { ChefBeginner } from '../models/ChefBeginner';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { RecipeEquipment } from '../models/RecipeEquipment';

interface AuthSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export class RecipeController extends GenericController<Recipe, RecipeDTO> {
  private ratingRepository: RatingRepository;
  private commentRepository: CommentRepository;
  private bookmarkRepository: BookmarkRepository;
  private userRepository: UserRepository;
  
  constructor() {
    super(new RecipeRepository());
    this.ratingRepository = new RatingRepository();
    this.commentRepository = new CommentRepository();
    this.bookmarkRepository = new BookmarkRepository();
    this.userRepository = new UserRepository();
  }

  private async getChefBeginnerIdFromSession(): Promise<number | undefined> {
    const session = await getServerSession(authOptions) as AuthSession | null;
    
    if (!session || !(session?.user as SessionUser)?.id) {
        throw new Error('Niste prijavljeni');
    }

    const sessionUser = session.user as SessionUser;
    const userId = parseInt(sessionUser.id);
    
    if (sessionUser.isAdmin || sessionUser.isModerator || sessionUser.isSponsor) {
        return undefined;
    }

    const users = await this.userRepository.findByExpression({
        id: userId
    });

    if (users.length === 0) {
        throw new Error('Korisnik nije pronađen');
    }

    const user = users[0];
    
    if (!user.ChefBeginner || !user.ChefBeginner.id) {
        return undefined;
    }

    return user.ChefBeginner.id;
  }

  translateDTO(dto: RecipeDTO): Recipe {
    return new Recipe({
      id: dto.id,
      title: dto.title,
      preparation_time: dto.preparation_time,
      heaviness: dto.heaviness as Heaviness,
      category: dto.category as Category,
      number_of_views: dto.number_of_views || 0,
      number_of_portions: dto.number_of_portions,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      chefBeginnerId: dto.chefBeginnerId,
      preparationSteps: dto.preparationSteps?.map(step => 
        new PreparationStep({
          id: step.id,
          stepNumber: step.stepNumber,
          description: step.description,
          recipeId: step.recipeId
        })
      ),
      ingredientItems: dto.ingredientItems?.map(item =>
        new IngredientItem({
          id: item.id,
          quantity: item.quantity,
          measurementUnit: item.measurementUnit,
          recipeId: item.recipeId,
          ingredientId: item.ingredientId
        })
      ),
      equipment: dto.equipment?.map(eq =>
        new RecipeEquipment({
          recipeId: eq.recipeId,
          equipmentId: eq.equipmentId
        })
      )
    });
  }

  translateModel(model: Recipe): RecipeDTO {
    const mapUserToDTO = (user: User) => ({
      id: user.id,
      gender: user.gender,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

    const mapChefBeginnerToDTO = (chef: ChefBeginner) => ({
      id: chef.id,
      privileged_user: chef.privileged_user,
      userId: chef.userId,
      user: chef.user ? mapUserToDTO(chef.user) : undefined
    });

    return {
      id: model.id,
      title: model.title,
      preparation_time: model.preparation_time,
      heaviness: model.heaviness,
      category: model.category,
      number_of_views: model.number_of_views,
      number_of_portions: model.number_of_portions,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      chefBeginnerId: model.chefBeginnerId,
      chefBeginner: model.chefBeginner ? mapChefBeginnerToDTO(model.chefBeginner) : undefined,
      preparationSteps: model.preparationSteps?.map(step => ({
        id: step.id,
        stepNumber: step.stepNumber,
        description: step.description,
        recipeId: step.recipeId
      })),
      ingredientItems: model.ingredientItems?.map(item => ({
        id: item.id,
        quantity: item.quantity,
        measurementUnit: item.measurementUnit,
        recipeId: item.recipeId,
        ingredientId: item.ingredientId,
        ingredient: item.ingredient ? {
          id: item.ingredient.id,
          name: item.ingredient.name
        } : undefined
      })),
      equipment: model.equipment?.map(item => ({
        recipeId: item.recipeId,
        equipmentId: item.equipmentId,
        equipment: item.equipment ? {
          id: item.equipment.id,
          name: item.equipment.name
        } : undefined
      })),
      comments: model.comments?.map(comment => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt,
        recipeId: comment.recipeId,
        chefBeginnerId: comment.chefBeginnerId,
        chefBeginner: comment.chefBeginner ? mapChefBeginnerToDTO(comment.chefBeginner) : undefined
      }) as CommentDTO),
      ratings: model.ratings?.map(rating => ({
        id: rating.id,
        value: rating.value,
        createdAt: rating.createdAt,
        recipeId: rating.recipeId,
        chefBeginnerId: rating.chefBeginnerId,
        chefBeginner: rating.chefBeginner ? mapChefBeginnerToDTO(rating.chefBeginner) : undefined
      }) as RatingDTO),
      bookmarks: model.bookmarks?.map(bookmark => ({
        id: bookmark.id,
        title: bookmark.title,
        recipeId: bookmark.recipeId,
        cookbookId: bookmark.cookbookId,
        createdAt: bookmark.createdAt
      }) as BookmarkDTO)
    };
  }

  verifyDTO(dto: RecipeDTO): boolean {
    const recipe = this.translateDTO(dto);
    return recipe.isValid();
  }

  async findByAnything({
    category,
    heaviness,
    startNumber,  // min broj porcija
    endNumber,  // max broj porcija
    startTime,
    endTime,
    search,
  }: {
    category?: Category | null;
    heaviness?: Heaviness | null;
    startNumber?: number | null;
    endNumber?: number | null;
    startTime?: number | null;
    endTime?: number | null;
    search?: string | null;
  }): Promise<RecipeDTO[]> {
    const where: any = {
      ...(category ? { category } : {}),
      ...(heaviness ? { heaviness } : {}),
      ...(startNumber || endNumber
        ? {
            number_of_portions: {
              ...(startNumber ? { gte: startNumber } : {}),
              ...(endNumber ? { lte: endNumber } : {}),
            },
          }
        : {}),
      ...(startTime || endTime
        ? {
            preparation_time: {
              ...(startTime ? { gte: startTime } : {}),
              ...(endTime ? { lte: endTime } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                },
              },
              {
                chefBeginner: { user: { OR: [{ first_name: search }, {last_name: search }]}}
              }
            ],
          }
        : {}),
    };

    const recipes = await (this.repository as RecipeRepository).findByAnything(where);

    return recipes.map((recipe) => this.translateModel(recipe));
  }
  
  async findByChefBeginnerId(chefBeginnerId: number): Promise<RecipeDTO[]> {
    const recipes = await (this.repository as RecipeRepository).findByChef(chefBeginnerId);
    return recipes.map(recipe => this.translateModel(recipe));
  }

  async getById(id: number): Promise<RecipeDTO | null> {
    const recipe = await (this.repository as RecipeRepository).getById(id);
    return recipe ? this.translateModel(recipe) : null;
  }

  async updateRecipe(recipeDTO: RecipeDTO): Promise<void> {
    if (!this.verifyDTO(recipeDTO)) {
      throw new Error('Invalid recipe data');
    }

    const session = await getServerSession(authOptions) as AuthSession | null;
    if (!session || !(session?.user as SessionUser)?.id) {
      throw new Error('Niste prijavljeni');
    }

    const userId = parseInt(session.user.id);
    const users = await this.userRepository.findByExpression({ id: userId });
    if (users.length === 0) throw new Error('Korisnik nije pronađen');
    const user = users[0];

    const isAdmin = !!user.Moderator?.Administrator;
    const isModerator = !!user.Moderator;
    const chefBeginnerId = user.ChefBeginner?.id || null;

    const existingRecipe = await this.repository.getById(recipeDTO.id);
    if (!existingRecipe) {
      throw new Error('Recept nije pronađen');
    }

    if (!isAdmin && !isModerator) {
      if (!chefBeginnerId || existingRecipe.chefBeginnerId !== chefBeginnerId) {
        throw new Error('Samo kreator recepta može da ga ažurira');
      }
    }

    const recipe = this.translateDTO(recipeDTO);
    await this.repository.update(recipe);
  }

  async deleteRecipe(id: number): Promise<void> {
    const session = await getServerSession(authOptions) as AuthSession | null;
    if (!session || !(session?.user as SessionUser)?.id) {
      throw new Error('Niste prijavljeni');
    }

    const userId = parseInt(session.user.id);
    const users = await this.userRepository.findByExpression({ id: userId });
    if (users.length === 0) throw new Error('Korisnik nije pronađen');
    const user = users[0];

    const isAdmin = !!user.Moderator?.Administrator;
    const isModerator = !!user.Moderator;
    const chefBeginnerId = user.ChefBeginner?.id || null;

    const existingRecipe = await this.repository.getById(id);
    if (!existingRecipe) {
      throw new Error('Recept nije pronađen');
    }

    if (!isAdmin && !isModerator) {
      if (!chefBeginnerId || existingRecipe.chefBeginnerId !== chefBeginnerId) {
        throw new Error('Samo kreator recepta može da ga obriše');
      }
    }

    await this.repository.delete(id);
  }

  async rateRecipe(idRecipe: number, ratingValue: number): Promise<void> {
    try {
        const chefBeginnerId = await this.getChefBeginnerIdFromSession();
        
        if (!chefBeginnerId) {
            throw new Error('Samo kuvari mogu da ocenjuju recepte');
        }

        const existingRecipe = await this.repository.getById(idRecipe);
        if (!existingRecipe) {
            throw new Error('Recept nije pronađen');
        }

        if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
            throw new Error('Ocena mora biti između 1 i 5');
        }

        if (existingRecipe.chefBeginnerId === chefBeginnerId) {
            throw new Error('Ne možete oceniti sopstveni recept');
        }

        const rating = new Rating({
            value: ratingValue,
            chefBeginnerId: chefBeginnerId,
            recipeId: idRecipe
        });

        const existingRating = await this.ratingRepository.findByUserAndRecipe(chefBeginnerId, idRecipe);
        
        if (existingRating) {
            await this.ratingRepository.update({
                ...existingRating,
                value: ratingValue
            } as Rating);
        } else {
            await this.ratingRepository.add(rating);
        }
    } catch (error) {
        console.error('Error in rateRecipe:', error);
        throw error;
    }
  }

  async getRecipeRating(recipeId: number): Promise<number> {
    return await this.ratingRepository.getAverageRating(recipeId);
  }

  async commentRecipe(idRecipe: number, commentText: string): Promise<void> {
    const chefBeginnerId = await this.getChefBeginnerIdFromSession();
    
    if (!chefBeginnerId) {
        throw new Error('Samo kuvari mogu da komentarišu recepte');
    }

    const existingRecipe = await this.repository.getById(idRecipe);
    if (!existingRecipe) {
        throw new Error('Recept nije pronađen');
    }

    if (existingRecipe.chefBeginnerId === chefBeginnerId) {
        throw new Error('Ne možete komentarisati sopstveni recept');
    }
    
    const comment = new Comment({
        text: commentText,
        chefBeginnerId: chefBeginnerId,
        recipeId: idRecipe
    });

    if (!comment.isValid()) {
        throw new Error('Invalid comment data');
    }

    await this.commentRepository.add(comment);
  }

  async getRecipeComments(recipeId: number): Promise<Comment[]> {
    return await this.commentRepository.findByRecipeId(recipeId);
  }

  async getRecipeBookmarks(recipeId: number): Promise<Bookmark[]> {
    const chefBeginnerId = await this.getChefBeginnerIdFromSession();
    
    if (!chefBeginnerId) {
      throw new Error('Samo kuvari mogu da vide bookmarkove');
    }

    const bookmarks = await this.bookmarkRepository.findByRecipeId(recipeId);
    
    return bookmarks.filter(bookmark => 
      bookmark.cookbook && 
      bookmark.cookbook.length > 0 && 
      bookmark.cookbook[0].chefBeginnerId === chefBeginnerId
    );
  }
  
  async getRecipeBookmarksInfo(recipeId: number, chefBeginnerId: number): Promise<any[]> {
    try {
      const bookmarkRepository = new BookmarkRepository();
      const bookmarks = await bookmarkRepository.findByChefAndRecipe(chefBeginnerId, recipeId);
      
      if(!bookmarks)
        return [];
      return bookmarks.map(bookmark => ({
        id: bookmark.id,
        cookbookId: bookmark.cookbookId,
        title: bookmark.title,
        createdAt: bookmark.createdAt
      }));
    } catch (error) {
      console.error('Greška pri dobijanju informacija o bookmarkovima:', error);
      throw error;
    }
  }

  async bookmarkRecipe(recipeId: number, cookbookIds: number[], title?: string): Promise<void> {
    // const chefBeginnerId = await this.getChefBeginnerIdFromSession();
    
    // if (!chefBeginnerId) {
    //   throw new Error('Samo kuvari mogu da bookmarkuju recepte');
    // }
    const chefBeginnerId = 14;
    if (!cookbookIds || cookbookIds.length === 0) {
      throw new Error('Morate proslediti bar jedan cookbook');
    }

    for (const cookbookId of cookbookIds) {
      
      const cookbook = await this.bookmarkRepository.getCookbookById(Number(cookbookId));
      if (!cookbook) {
        throw new Error(`Cookbook sa ID ${cookbookId} nije pronađen`);
      }
      if (cookbook.chefBeginnerId !== chefBeginnerId) {
        throw new Error('Možete dodavati bookmarkove samo u svoje cookbookove');
      }
    }

    const existingRecipe = await this.repository.getById(recipeId);
    if (!existingRecipe) {
      throw new Error('Recept nije pronađen');
    }

    if (existingRecipe.chefBeginnerId === chefBeginnerId) {
      throw new Error('Ne možete bookmarkovati sopstveni recept');
    }

    await this.bookmarkRepository.bookmarkRecipeInMultipleCookbooks(
      recipeId, 
      cookbookIds, 
      title || `Bookmark za ${existingRecipe.title}`
    );
  }

  async bookmarkRecipeInCookbook(recipeId: number, cookbookId: number, title?: string): Promise<void> {
    // const chefBeginnerId = await this.getChefBeginnerIdFromSession();
    
    // if (!chefBeginnerId) {
    //   throw new Error('Samo kuvari mogu da bookmarkuju recepte');
    // }

    const cookbook = await this.bookmarkRepository.getCookbookById(cookbookId);
    if (!cookbook) {
      throw new Error('Cookbook nije pronađen');
    }

    // if (cookbook.chefBeginnerId !== chefBeginnerId) {
    //   throw new Error('Možete dodavati bookmarkove samo u svoje cookbookove');
    // }

    const existingRecipe = await this.repository.getById(recipeId);
    if (!existingRecipe) {
      throw new Error('Recept nije pronađen');
    }

    // if (existingRecipe.chefBeginnerId === chefBeginnerId) {
    //   throw new Error('Ne možete bookmarkovati sopstveni recept');
    // }

    await this.bookmarkRepository.bookmarkRecipe(
      recipeId, 
      cookbookId, 
      title || `Bookmark za ${existingRecipe.title}`
    );
  }
  async removeBookmarkFromCookbook(recipeId: number, cookbookId: number): Promise<any> {
    try {
      const chefBeginnerId = await this.getChefBeginnerIdFromSession();
      if (!chefBeginnerId) {
        throw new Error('Samo kuvari mogu da uklanjaju bookmarkove');
      }

      if (isNaN(recipeId) || recipeId <= 0) {
        throw new Error('Nevalidan ID recepta');
      }
      
      if (isNaN(cookbookId) || cookbookId <= 0) {
        throw new Error('Nevalidan ID cookbooka');
      }

      const cookbook = await this.bookmarkRepository.getCookbookById(cookbookId);
      if (!cookbook) {
        throw new Error('Cookbook nije pronađen');
      }

      if (cookbook.chefBeginnerId !== chefBeginnerId) {
        throw new Error('Možete uklanjati bookmarkove samo iz svojih cookbookova');
      }
      const bookmark = await this.bookmarkRepository.findByChefRecipeAndCookbook(14,recipeId, cookbookId);
      if (!bookmark) {
        return {
          success: true,
          deleted: false,
          message: 'Bookmark nije pronađen (verovatno je već obrisan)',
          recipeId: recipeId,
          cookbookId: cookbookId
        };
      }

      const result = await this.bookmarkRepository.deleteByCookbookAndRecipe(cookbookId, recipeId);
      
      return {
        success: true,
        deleted: true,
        message: 'Bookmark je uspešno obrisan ',
        recipeId: recipeId,
        cookbookId: cookbookId
      };
    } catch (error) {
      console.error(`Greška pri uklanjanju bookmarka recepta ${recipeId} iz cookbook ${cookbookId}:`, error);
      throw error;
    }
  }
  async removeBookmarkFromAllCookbooks(recipeId: number): Promise<void> {
    // const chefBeginnerId = await this.getChefBeginnerIdFromSession();
    
    // if (!chefBeginnerId) {
    //   throw new Error('Samo kuvari mogu da uklanjaju bookmarkove');
    // }

    const chefBeginnerId = 14;
    await this.bookmarkRepository.deleteByChefAndRecipe(chefBeginnerId, recipeId);
  }

 

  async updateBookmark(bookmarkId: number, updates: { title?: string; cookbookId?: number }): Promise<void> {
    // const chefBeginnerId = await this.getChefBeginnerIdFromSession();
    
    // if (!chefBeginnerId) {
    //   throw new Error('Samo kuvari mogu da ažuriraju bookmarkove');
    // }

    const existingBookmark = await this.bookmarkRepository.getById(bookmarkId);
    if (!existingBookmark) {
      throw new Error('Bookmark nije pronađen');
    }
    // if (!existingBookmark.cookbook || existingBookmark.cookbook.length === 0 || 
    //     existingBookmark.cookbook[0].chefBeginnerId !== chefBeginnerId) {
    //   throw new Error('Možete ažurirati samo svoje bookmarkove');
    // }

    const updatedBookmark = new Bookmark({
      ...existingBookmark,
      title: updates.title || existingBookmark.title,
      cookbookId: updates.cookbookId || existingBookmark.cookbookId,
      updatedAt: new Date()
    });

    if (!updatedBookmark.isValid()) {
      throw new Error('Invalid bookmark data');
    }

    await this.bookmarkRepository.update(updatedBookmark);
  }
  async searchRecipes(query: string): Promise<RecipeDTO[]> {
    const recipes = await (this.repository as RecipeRepository).searchRecipes(query);
    return recipes.map(recipe => this.translateModel(recipe));
  }

  async incrementViewCount(id: number): Promise<void> {
    await (this.repository as RecipeRepository).incrementViewCount(id);
  }

  async getRecentRecipes(limit: number = 10): Promise<RecipeDTO[]> {
    const recipes = await (this.repository as RecipeRepository).findByExpression({
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    return recipes.map(recipe => this.translateModel(recipe));
  }

}