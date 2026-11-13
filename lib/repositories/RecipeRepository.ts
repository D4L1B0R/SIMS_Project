import { prisma } from '@/prisma/prismaclient';
import { GenericRepository } from './GenericRepository'; 
import { Recipe } from '../models/Recipe';
import { Category, Heaviness } from '../models/enums';
import { PreparationStep } from '../models/PreparationStep';
import { IngredientItem } from '../models/IngredientItem';
import { RecipeEquipment } from '../models/RecipeEquipment';
import { Rating } from '../models/Rating';
import { Bookmark } from '../models/Bookmark';
import { Moderator } from '../models/Moderator';
import { RankingList } from '../models/RankingList';
import { Sponsor } from '../models/Sponsor';
import { AdStats } from '../models/AdStats';
import { Comment } from '../models/Comment';

export class RecipeRepository extends GenericRepository<Recipe> {
  protected prismaModel = prisma.recipe;

  private mapToRecipeModel(prismaRecipe: any): Recipe {
    return new Recipe({
      id: prismaRecipe.id,
      title: prismaRecipe.title,
      preparation_time: prismaRecipe.preparation_time,
      heaviness: prismaRecipe.heaviness,
      category: prismaRecipe.category,
      number_of_views: prismaRecipe.number_of_views,
      number_of_portions: prismaRecipe.number_of_portions,
      createdAt: prismaRecipe.createdAt,
      updatedAt: prismaRecipe.updatedAt,
      chefBeginnerId: prismaRecipe.chefBeginnerId,
      chefBeginner: prismaRecipe.chefBeginner,
      preparationSteps: prismaRecipe.preparationSteps ? 
        prismaRecipe.preparationSteps.map((step: any) => new PreparationStep(step)) : [],
      equipment: prismaRecipe.equipment ? 
        prismaRecipe.equipment.map((eq: any) => new RecipeEquipment({
          recipeId: eq.recipeId,
          equipmentId: eq.equipmentId,
          equipment: eq.equipment
        })) : [],
      ingredientItems: prismaRecipe.ingredientItems ? 
        prismaRecipe.ingredientItems.map((item: any) => new IngredientItem(item)) : [],
      ratings: prismaRecipe.ratings ? 
        prismaRecipe.ratings.map((rating: any) => new Rating(rating)) : [],
      comments: prismaRecipe.comments ? 
        prismaRecipe.comments.map((comment: any) => new Comment(comment)) : [],
      bookmarks: prismaRecipe.bookmarks ? 
        prismaRecipe.bookmarks.map((bookmark: any) => new Bookmark(bookmark)) : [],
      moderators: prismaRecipe.moderators ? 
        prismaRecipe.moderators.map((moderator: any) => new Moderator(moderator)) : [],
      rankingLists: prismaRecipe.rankingLists ? 
        prismaRecipe.rankingLists.map((rankingList: any) => new RankingList(rankingList)) : [],
      sponsors: prismaRecipe.sponsors ? 
        prismaRecipe.sponsors.map((sponsor: any) => new Sponsor(sponsor)) : [],
      adStats: prismaRecipe.adStats ? 
        prismaRecipe.adStats.map((adStat: any) => new AdStats(adStat)) : []
    });
  }

  async getAll(): Promise<Recipe[]> {
    const recipes = await this.prismaModel.findMany({
      include: {
        chefBeginner: {
          include: {
            user: true
          }
        },
        preparationSteps: true,
        equipment: {
          include: {
            equipment: true
          }
        },
        ingredientItems: {
          include: {
            ingredient: true
          }
        },
        ratings: true,
        comments: {
          include: {
            chefBeginner: {
              include: {
                user: true,
              }
            }
          }
        },
        bookmarks: true,
        moderators: {
          include: {
            Administrator: true
          }
        },
        rankingLists: true,
        sponsors: true,
        adStats: true
      }
    });
    return recipes.map(recipe => this.mapToRecipeModel(recipe));
  }

  async getById(id: number): Promise<Recipe | null> {
    const recipe = await this.prismaModel.findUnique({
      where: { id },
      include: {
        chefBeginner: {
          include: {
            user: true 
          }
        },
        preparationSteps: true,
        equipment: {
          include: {
            equipment: true
          }
        },
        ingredientItems: {
          include: {
            ingredient: true
          }
        },
        ratings: true,
        comments: {
          include: {
            chefBeginner: {
              include: {
                user: true,
              }
            }
          }
        },
        bookmarks: true,
        moderators: {
          include: {
            Administrator: true
          }
        },
        rankingLists: true,
        sponsors: true,
        adStats: true
      }
    });
    return recipe ? this.mapToRecipeModel(recipe) : null;
  }

  async findByExpression(expression: any): Promise<Recipe[]> {
    const recipes = await this.prismaModel.findMany({
      where: expression,
      include: {
        chefBeginner: {
          include: {
            user: true
          }
        },
        preparationSteps: true,
        equipment: {
          include: {
            equipment: true
          }
        },
        ingredientItems: {
          include: {
            ingredient: true
          }
        },
        ratings: true,
        comments: {
          include:{
            chefBeginner:{
              include:{
                user: true,
              }
            }
          }
        },
        bookmarks: true,
        moderators: {
          include:{
            Administrator: true
          }
        },
        rankingLists: true,
        sponsors: true,
        adStats: true
      }
    });
    return recipes.map(recipe => this.mapToRecipeModel(recipe));
  }

  async add(entity: Recipe): Promise<void> {
    if (!entity.isValid()) {
      throw new Error('Invalid Recipe entity');
    }

    await this.prismaModel.create({
      data: {
        title: entity.title,
        preparation_time: entity.preparation_time,
        heaviness: entity.heaviness,
        category: entity.category,
        number_of_portions: entity.number_of_portions,
        chefBeginnerId: entity.chefBeginnerId,
        preparationSteps: entity.preparationSteps ? {
          create: entity.preparationSteps.map(step => ({
            stepNumber: step.stepNumber,
            description: step.description
          }))
        } : undefined,
        equipment: entity.equipment ? {
          create: entity.equipment.map(eq => ({
            equipmentId: eq.equipmentId
          }))
        } : undefined,
        ingredientItems: entity.ingredientItems ? {
          create: entity.ingredientItems.map(item => ({
            quantity: item.quantity,
            measurementUnit: item.measurementUnit,
            ingredientId: item.ingredientId
          }))
        } : undefined
      }
    });
  }

  async update(entity: Recipe): Promise<void> {
    if (!entity.isValid()) {
      throw new Error('Invalid Recipe entity');
    }

    await this.prismaModel.update({
      where: { id: entity.id },
      data: {
        title: entity.title,
        preparation_time: entity.preparation_time,
        heaviness: entity.heaviness,
        category: entity.category,
        number_of_portions: entity.number_of_portions,
        preparationSteps: entity.preparationSteps ? {
          deleteMany: {},
          create: entity.preparationSteps.map(step => ({
            stepNumber: step.stepNumber,
            description: step.description
          }))
        } : undefined,
        equipment: entity.equipment ? {
          deleteMany: {},
          create: entity.equipment.map(eq => ({
            equipmentId: eq.equipmentId
          }))
        } : undefined,
        ingredientItems: entity.ingredientItems ? {
          deleteMany: {},
          create: entity.ingredientItems.map(item => ({
            quantity: item.quantity,
            measurementUnit: item.measurementUnit,
            ingredientId: item.ingredientId
          }))
        } : undefined
      }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.preparationStep.deleteMany({ where: { recipeId: id } });
      await tx.ingredientItem.deleteMany({ where: { recipeId: id } });
      await tx.recipeEquipment.deleteMany({ where: { recipeId: id } });
      await tx.rating.deleteMany({ where: { recipeId: id } });
      await tx.comment.deleteMany({ where: { recipeId: id } });
      await tx.bookmark.deleteMany({ where: { recipeId: id } });

      await tx.recipe.delete({ where: { id } });
    });
  }

  async findByAnything(data: { category?: Category | null, heaviness?: Heaviness | null, number_of_portions?: { gte?: number | null, lte?: number | null } | null, preparation_time?: { gte?: number | null, lte?: number | null } | null, OR?: any[]}): Promise<Recipe[]> {
    return this.findByExpression(data);
  }
  async findByCategory(category: Category): Promise<Recipe[]> {
    return this.findByExpression({ category });
  }

  async findByHeaviness(heaviness: Heaviness): Promise<Recipe[]> {
    return this.findByExpression({ heaviness });
  }

  async findByChef(chefBeginnerId: number): Promise<Recipe[]> {
    return this.findByExpression({ chefBeginnerId });
  }

  async findByChefName(userName: string): Promise<Recipe[]> {
    const nameParts = userName.trim().split(/\s+/);
    const conditions: any[] = [];

    if (nameParts.length === 1) {
      conditions.push(
        { first_name: { contains: nameParts[0], mode: 'insensitive' } },
        { last_name: { contains: nameParts[0], mode: 'insensitive' } }
      );
    } else if (nameParts.length >= 2) {
      conditions.push({
        AND: [
          { first_name: { contains: nameParts[0], mode: 'insensitive' } },
          { last_name: { contains: nameParts[1], mode: 'insensitive' } }
        ]
      });
    }

    return this.findByExpression({
      chefBeginner: {
        user: {
          OR: conditions
        }
      }
    });
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    return this.findByExpression({
      title: {
        contains: query,
        // mode: 'insensitive'
      }
    });
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.prismaModel.update({
      where: { id },
      data: {
        number_of_views: {
          increment: 1
        }
      }
    });
  }
}