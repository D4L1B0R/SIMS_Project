import { prisma } from '@/prisma/prismaclient';
import { GenericRepository } from './GenericRepository';
import { Rating } from '../models/Rating';

export class RatingRepository extends GenericRepository<Rating> {
	protected prismaModel = prisma.rating;

	private mapToRatingModel(prismaRating: any): Rating {
			return new Rating({
					id: prismaRating.id,
					value: prismaRating.value,
					chefBeginnerId: prismaRating.chefBeginnerId,
					recipeId: prismaRating.recipeId,
					createdAt: prismaRating.createdAt,
					updatedAt: prismaRating.updatedAt,
					chefBeginner: prismaRating.chefBeginner,
					recipe: prismaRating.recipe
			});
	}

	async getAll(): Promise<Rating[]> {
			const ratings = await this.prismaModel.findMany({
					include: {
							chefBeginner: {
									include: {
											user: true
									}
							},
							recipe: true
					}
			});
			return ratings.map(rating => this.mapToRatingModel(rating));
	}

	async getById(id: number): Promise<Rating | null> {
			const rating = await this.prismaModel.findUnique({
					where: { id },
					include: {
							chefBeginner: {
									include: {
											user: true
									}
							},
							recipe: true
					}
			});
			return rating ? this.mapToRatingModel(rating) : null;
	}

	async findByChefBeginnerId(chefBeginnerId: number): Promise<Rating[]> {
			return this.findByExpression({ chefBeginnerId });
	}

	async findByRecipeId(recipeId: number): Promise<Rating[]> {
			return this.findByExpression({ recipeId });
	}

	async findByUserAndRecipe(chefBeginnerId: number, recipeId: number): Promise<Rating | null> {
			const ratings = await this.findByExpression({
					chefBeginnerId,
					recipeId
			});
			return ratings.length > 0 ? ratings[0] : null;
	}

	async getAverageRating(recipeId: number): Promise<number> {
			const result = await this.prismaModel.aggregate({
					where: { recipeId },
					_avg: {
							value: true
					}
			});
			
			return result._avg.value || 0;
	}

	async add(entity: Rating): Promise<void> {
			if (!entity.isValid()) {
			    throw new Error('Invalid Rating entity');
			}

			await this.prismaModel.create({
					data: {
							value: entity.value,
							chefBeginnerId: entity.chefBeginnerId,
							recipeId: entity.recipeId
					}
			});
	}

	async update(entity: Rating): Promise<void> {
			// if (!entity.isValid()) {
			//     throw new Error('Invalid Rating entity');
			// }

			await this.prismaModel.update({
					where: { id: entity.id },
					data: { 
							value: entity.value
					}
			});
	}
}