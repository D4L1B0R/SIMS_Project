import { prisma } from "@/prisma/prismaclient";
import { RankingList } from "../models/RankingList";
import { GenericRepository } from "./GenericRepository";
import { Recipe } from "../models/Recipe";
import { Moderator } from "../models/Moderator";

export class RankingListRepository extends GenericRepository<RankingList> {
    protected prismaModel = prisma.rankingList;

    private mapToRankingListModel(prismaRanking: any): RankingList {
        return new RankingList({
            id: prismaRanking.id,
            description: prismaRanking.description,
            created_at: prismaRanking.created_at,
            updated_at: prismaRanking.updated_at,
            moderatorId: prismaRanking.moderatorId,
            moderator: new Moderator(prismaRanking.moderator),
            recipes: prismaRanking.recipes
                ? prismaRanking.recipes.map((r: any) => new Recipe(r))
                : []
        });
    }

   async getAll(): Promise<RankingList[]> {
    const lists = await this.prismaModel.findMany({
            include: {
                moderator: true,
                recipes: {
                    include: {
                    preparationSteps: true,
                    ingredientItems: true,
                    },
                },
            },
        });

     return lists.map((list) => this.mapToRankingListModel(list));
    }

    async findByExpression(expression: any): Promise<RankingList[]> {
        const lists = await this.prismaModel.findMany({
            where: expression,
            include: {
                moderator: true,
                recipes: true
            }
        });

        return lists.map((list) => this.mapToRankingListModel(list));
    }

    async getAllMod(moderatorId: number): Promise<RankingList[]> {
        const lists = await this.findByExpression({ moderatorId: moderatorId });
        
        console.log(lists);
        return lists;
    }

    async add(entity: RankingList): Promise<void> {
        if (!entity.description || !entity.moderatorId) {
            throw new Error('Invalid RankingList entity (description and moderatorId are required)');
        }

        console.log(entity);

        await this.prismaModel.create({
            data: {
                    description: entity.description,
                    moderatorId: entity.moderatorId,
                    recipes: entity.recipes
                    ? {
                        connect: entity.recipes.map((r) => ({ id: r.id }))
                        }
                    : undefined
            }
        });
    }

    async getById(id: number): Promise<RankingList | null> {
        const rankingList = await this.prismaModel.findUnique({ where: { id }, include: { moderator: true, recipes: true }});
        return rankingList ? this.mapToRankingListModel(rankingList) : null;
    }

    async addRecipes(id: number, recipeIds: number[]): Promise<void> {
        await prisma.$transaction(
        recipeIds.map((recipeId) =>
            prisma.rankingList.update({
                where: { id },
                data: {
                    recipes: { connect: { id: recipeId } },
                },
            })
        ));
    }

    async updateList(id: number, data: { description: string }): Promise<void> {
        await this.prismaModel.update({ where: { id }, data });
    }

    async deleteList(id: number) {
        await this.prismaModel.delete({ where: { id }});
    }

    async deleteRecipe(id: number, recipeId: number) {
        await prisma.rankingList.update({
            where: { id },
            data: {
                recipes: { disconnect: { id: recipeId } },
            },
        })
    }

}