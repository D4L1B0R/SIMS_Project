import { prisma } from '@/prisma/prismaclient';
import { GenericRepository } from './GenericRepository';
import { Comment } from '../models/Comment';

export class CommentRepository extends GenericRepository<Comment> {
    protected prismaModel = prisma.comment;

    private mapToCommentModel(prismaComment: any): Comment {
        return new Comment({
            id: prismaComment.id,
            text: prismaComment.text,
            chefBeginnerId: prismaComment.chefBeginnerId,
            recipeId: prismaComment.recipeId,
            createdAt: prismaComment.createdAt,
            updatedAt: prismaComment.updatedAt,
            chefBeginner: prismaComment.chefBeginner,
            recipe: prismaComment.recipe
        });
    }

    async getAll(): Promise<Comment[]> {
        const comments = await this.prismaModel.findMany({
            include: {
                chefBeginner: {
                    include: {
                        user: true
                    }
                },
                recipe: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return comments.map(comment => this.mapToCommentModel(comment));
    }

    async getById(id: number): Promise<Comment | null> {
        const comment = await this.prismaModel.findUnique({
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
        return comment ? this.mapToCommentModel(comment) : null;
    }

    async add(entity: Comment): Promise<void> {
        if (!entity.isValid()) {
            throw new Error('Invalid Comment entity');
        }

        await this.prismaModel.create({
            data: {
                text: entity.text,
                chefBeginnerId: entity.chefBeginnerId,
                recipeId: entity.recipeId
            }
        });
    }

    async update(entity: Comment): Promise<void> {
        if (!entity.isValid()) {
            throw new Error('Invalid Comment entity');
        }

        await this.prismaModel.update({
            where: { id: entity.id },
            data: {
                text: entity.text
            }
        });
    }

    async delete(id:number):Promise<void>{

			const comment  = this.findByRecipeId(id);
			if(!comment){
					throw new Error("Invalid Comment entity");
			}

			await this.prismaModel.delete({
					where:{id: id}
			})
    }
    async findByChefBeginnerId(chefBeginnerId: number): Promise<Comment[]> {
			return this.findByExpression({ 
					chefBeginnerId 
			});
    }

    async findByRecipeId(recipeId: number): Promise<Comment[]> {
			return this.findByExpression({ 
					recipeId 
			});
    }

    async findRecentComments(limit: number = 10): Promise<Comment[]> {
			const comments = await this.prismaModel.findMany({
					include: {
							chefBeginner: {
									include: {
											user: true
									}
							},
							recipe: true
					},
					orderBy: {
							createdAt: 'desc'
					},
					take: limit
			});
			return comments.map(comment => this.mapToCommentModel(comment));
    }

    
}