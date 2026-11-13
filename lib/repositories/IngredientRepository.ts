import { prisma } from '@/prisma/prismaclient';
import { GenericRepository } from './GenericRepository';
import { Ingredient } from '../models/Ingredient';

export class IngredientRepository extends GenericRepository<Ingredient> {
  protected prismaModel = prisma.ingredient;

  private mapToIngredientModel(prismaIngredient: any): Ingredient {
    return new Ingredient({
        id: prismaIngredient.id,
        name: prismaIngredient.name,
        ingredientItems: prismaIngredient.ingredientItems || []
    });
  }

  async getAll(): Promise<Ingredient[]> {
    const ingredients = await this.prismaModel.findMany({
        include: {
            ingredientItems: true
        }
    });
    return ingredients.map(ingredient => this.mapToIngredientModel(ingredient));
  }

  async getById(id: number): Promise<Ingredient | null> {
    const ingredient = await this.prismaModel.findUnique({
        where: { id },
        include: {
            ingredientItems: true
        }
    });
    return ingredient ? this.mapToIngredientModel(ingredient) : null;
  }

  async findByName(name: string): Promise<Ingredient[]> {
    return this.findByExpression({
        name: {
            contains: name,
            mode: 'insensitive'
        }
    });
  }

  async add(entity: Ingredient): Promise<void> {
    if (!entity.isValid()) {
        throw new Error('Invalid Ingredient entity');
    }

    await this.prismaModel.create({
        data: {
            name: entity.name
        }
    });
  }

  async update(entity: Ingredient): Promise<void> {
    if (!entity.isValid()) {
        throw new Error('Invalid Ingredient entity');
    }

    await this.prismaModel.update({
        where: { id: entity.id },
        data: {
            name: entity.name
        }
    });
  }
}