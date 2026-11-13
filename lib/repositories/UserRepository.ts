import { prisma } from '@/prisma/prismaclient';
import { GenericRepository } from './GenericRepository';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { ChefBeginner } from '../models/ChefBeginner';
import { Moderator } from '../models/Moderator';
import { Administrator } from '../models/Administrator';
import { Sponsor } from '../models/Sponsor';

export class UserRepository extends GenericRepository<User> {
    protected prismaModel = prisma.user;

    private mapToUserModel(prismaUser: any): User {
        return new User({
            id: prismaUser.id,
            gender: prismaUser.gender,
            first_name: prismaUser.first_name,
            last_name: prismaUser.last_name,
            phone_number: prismaUser.phone_number,
            date_of_birth: prismaUser.date_of_birth,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            profile: prismaUser.profile ? new Profile(prismaUser.profile) : undefined,
            ChefBeginner: prismaUser.ChefBeginner ? new ChefBeginner(prismaUser.ChefBeginner) : undefined,
            Moderator: prismaUser.Moderator ? new Moderator({
                id: prismaUser.Moderator.id,
                userId: prismaUser.Moderator.userId,
                Administrator: prismaUser.Moderator.Administrator ? new Administrator({
                    id: prismaUser.Moderator.Administrator.id,
                    moderatorId: prismaUser.Moderator.Administrator.moderatorId
                }) : undefined
            }) : undefined,
            Sponsor: prismaUser.Sponsor ? new Sponsor({
                id: prismaUser.Sponsor.id,
                userId: prismaUser.Sponsor.userId,
                pib: prismaUser.Sponsor.pib,
                company_name: prismaUser.Sponsor.company_name
            }) : undefined
        });
    }

    async getAll(): Promise<User[]> {
        const users = await this.prismaModel.findMany({
            include: {
                profile: true,
                ChefBeginner: true,
                Moderator: {
                    include: {
                        Administrator: true
                    }
                },
                Sponsor: true 
            }
        });
        return users.map(user => this.mapToUserModel(user));
    }

    async getById(id: number): Promise<User | null> {
        const user = await this.prismaModel.findUnique({
            where: { id },
            include: {
                profile: true,
                ChefBeginner: true,
                Moderator: {
                    include: {
                        Administrator: true
                    }
                },
                Sponsor: true 
            }
        });
        return user ? this.mapToUserModel(user) : null;
    }

    async findByExpression(expression: any): Promise<User[]> {
        const users = await this.prismaModel.findMany({
            where: expression,
            include: {
                profile: true,
                ChefBeginner: true,
                Moderator: {
                    include: {
                        Administrator: true
                    }
                },
                Sponsor: true
            }
        });
        return users.map(user => this.mapToUserModel(user));
    }

    async add(entity: User): Promise<void> {
        if (!entity.isValid()) {
            throw new Error('Invalid User entity');
        }

        await this.prismaModel.create({
            data: {
                gender: entity.gender,
                first_name: entity.first_name,
                last_name: entity.last_name,
                phone_number: entity.phone_number,
                date_of_birth: entity.date_of_birth,
                profile: entity.profile ? {
                    create: {
                        email: entity.profile.email,
                        password: entity.profile.password
                    }
                } : undefined,
                ChefBeginner: entity.ChefBeginner ? {
                    create: {
                        privileged_user: entity.ChefBeginner.privileged_user
                    }
                } : undefined,
                Sponsor: entity.Sponsor ? {
                    create: {
                        pib: entity.Sponsor.pib,
                        company_name: entity.Sponsor.company_name
                    }
                } : undefined
            }
        });
    }

    async update(entity: User): Promise<void> {
        if (!entity.isValid()) {
            throw new Error('Invalid User entity');
        }

        await this.prismaModel.update({
            where: { id: entity.id },
            data: {
                gender: entity.gender,
                first_name: entity.first_name,
                last_name: entity.last_name,
                phone_number: entity.phone_number,
                date_of_birth: entity.date_of_birth,
                profile: entity.profile ? {
                    update: {
                        email: entity.profile.email,
                        password: entity.profile.password
                    }
                } : undefined,
                ChefBeginner: entity.ChefBeginner ? {
                    update: {
                        privileged_user: entity.ChefBeginner.privileged_user
                    }
                } : undefined,
                Sponsor: entity.Sponsor ? {
                    update: {
                        pib: entity.Sponsor.pib,
                        company_name: entity.Sponsor.company_name
                    }
                } : undefined
            }
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const moderator = await tx.moderator.findFirst({
                where: { userId: id },
                include: { Administrator: true }
            });

            if (moderator) {
                if (moderator.Administrator) {
                    await tx.administrator.delete({
                        where: { moderatorId: moderator.userId }
                    });
                }
                
                await tx.moderator.delete({
                    where: { userId: moderator.userId }
                });
            }

            const sponsor = await tx.sponsor.findFirst({
                where: { userId: id }
            });

            if (sponsor) {
                await tx.adStats.deleteMany({ where: { sponsorId: sponsor.userId } });
                
                await tx.ad.deleteMany({ where: { sponsorId: sponsor.userId } });
                
                await tx.sponsor.delete({ where: { userId: id } });
            }

            const chefBeginner = await tx.chefBeginner.findFirst({
                where: { userId: id },
                select: { id: true }
            });

            if (chefBeginner) {
                const chefBeginnerId = chefBeginner.id;

                const recipes = await tx.recipe.findMany({
                    where: { chefBeginnerId },
                    select: { id: true }
                });

                const recipeIds = recipes.map(recipe => recipe.id);

                if (recipeIds.length > 0) {
                    await tx.preparationStep.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.ingredientItem.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.recipeEquipment.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.rating.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.comment.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.bookmark.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    
                    await tx.recipe.deleteMany({ where: { id: { in: recipeIds } } });
                }

                await tx.rating.deleteMany({ where: { chefBeginnerId } });
                await tx.comment.deleteMany({ where: { chefBeginnerId } });
                await tx.cookbook.deleteMany({ where: { chefBeginnerId } });

                await tx.chefBeginner.deleteMany({ where: { userId: id } });
            }

            await tx.profile.deleteMany({ where: { userId: id } });

            await tx.user.delete({ where: { id } });
        });
    }


    async setToModerator(userId: number): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: {
                    ChefBeginner: true,
                    Sponsor: true,
                    Moderator: {
                        include: {
                            Administrator: true
                        }
                    }
                }
            });

            if (!user) {
                throw new Error('Korisnik nije pronađen');
            }

            if (user.Moderator?.Administrator) {
                await tx.administrator.delete({
                    where: { moderatorId: user.Moderator.userId }
                });
            }

            if (user.ChefBeginner) {
                const chefBeginnerId = user.ChefBeginner.id;

                const recipes = await tx.recipe.findMany({
                    where: { chefBeginnerId },
                    select: { id: true }
                });

                const recipeIds = recipes.map(recipe => recipe.id);

                if (recipeIds.length > 0) {
                    await tx.preparationStep.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.ingredientItem.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.recipeEquipment.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.rating.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.comment.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.bookmark.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.recipe.deleteMany({ where: { id: { in: recipeIds } } });
                }

                await tx.rating.deleteMany({ where: { chefBeginnerId } });
                await tx.comment.deleteMany({ where: { chefBeginnerId } });
                await tx.cookbook.deleteMany({ where: { chefBeginnerId } });
                await tx.chefBeginner.delete({ where: { id: chefBeginnerId } });
            }

            if (user.Sponsor) {
                await tx.sponsor.delete({ where: { userId } });
            }

            if (!user.Moderator) {
                await tx.moderator.create({
                    data: {
                        userId: userId
                    }
                });
            }
        });
    }

    async setToAdmin(userId: number): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const existingModerator = await tx.moderator.findUnique({
                where: { userId },
                include: { Administrator: true }
            });

            if (!existingModerator) {
                await this.setToModerator(userId);
            }

            const moderator = await tx.moderator.findUnique({
                where: { userId },
                include: { Administrator: true }
            });

            if (!moderator) {
                throw new Error('Moderator nije pronađen');
            }

            if (!moderator.Administrator) {
                await tx.administrator.create({
                    data: {
                        moderatorId: moderator.userId
                    }
                });
            }
        });
    }

    async setToChefBeginner(userId: number, privileged_user: boolean = false): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: {
                    Sponsor: true,
                    Moderator: {
                        include: { Administrator: true }
                    },
                    ChefBeginner: true
                }
            });

            if (!user) {
                throw new Error('Korisnik nije pronađen');
            }

            if (user.Sponsor) {
                await tx.sponsor.delete({ where: { userId } });
            }

            if (user.Moderator) {
                if (user.Moderator.Administrator) {
                    await tx.administrator.delete({
                        where: { moderatorId: user.Moderator.userId }
                    });
                }
                await tx.moderator.delete({
                    where: { userId }
                });
            }

            if (!user.ChefBeginner) {
                await tx.chefBeginner.create({
                    data: {
                        userId: userId,
                        privileged_user: privileged_user
                    }
                });
            } else {
                await tx.chefBeginner.update({
                    where: { userId },
                    data: { privileged_user }
                });
            }
        });
    }

    async setToSponsor(userId: number, pib: string, company_name: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: {
                    ChefBeginner: true,
                    Moderator: {
                        include: { Administrator: true }
                    },
                    Sponsor: true
                }
            });

            if (!user) {
                throw new Error('Korisnik nije pronađen');
            }

            if (user.ChefBeginner) {
                const chefBeginnerId = user.ChefBeginner.id;

                const recipes = await tx.recipe.findMany({
                    where: { chefBeginnerId },
                    select: { id: true }
                });

                const recipeIds = recipes.map(recipe => recipe.id);

                if (recipeIds.length > 0) {
                    await tx.preparationStep.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.ingredientItem.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.recipeEquipment.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.rating.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.comment.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.bookmark.deleteMany({ where: { recipeId: { in: recipeIds } } });
                    await tx.recipe.deleteMany({ where: { id: { in: recipeIds } } });
                }

                await tx.rating.deleteMany({ where: { chefBeginnerId } });
                await tx.comment.deleteMany({ where: { chefBeginnerId } });
                await tx.cookbook.deleteMany({ where: { chefBeginnerId } });
                await tx.chefBeginner.delete({ where: { id: chefBeginnerId } });
            }

            if (user.Moderator) {
                if (user.Moderator.Administrator) {
                    await tx.administrator.delete({
                        where: { moderatorId: user.Moderator.userId }
                    });
                }
                await tx.moderator.delete({
                    where: { userId }
                });
            }

            if (user.Sponsor) {
                await tx.sponsor.update({
                    where: { userId },
                    data: {
                        pib,
                        company_name
                    }
                });
            } else {
                await tx.sponsor.create({
                    data: {
                        userId: userId,
                        pib,
                        company_name
                    }
                });
            }
        });
    }
    async isAdmin(userId: number): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    Moderator: {
                        include: {
                            Administrator: true
                        }
                    },
                    Sponsor:true
                }
            });

            return !!user?.Moderator?.Administrator;
        } catch (error) {
            console.error('Greška pri proveri admin statusa:', error);
            return false;
        }
    }
    async isModerator(userId:number): Promise<boolean>{
        try{
            const user = await prisma.user.findUnique({
                where:{id: userId},
                include:{
                    Moderator:{
                        include:{
                            Administrator: true
                        }
                    }
                }
            });
            return !!user?.Moderator;

        }
        catch(error){
            console.error("Greska pri proveri moderatorskog statusa",error);
            return false;
        }
    }
    async isSponsor(userId:number): Promise<boolean>{
        try{
            const user = await prisma.user.findUnique({
                where:{id:userId},
                include:{
                    Sponsor:true
                }
            });
            return !!user?.Sponsor;

        }
        catch(err){
            console.error("Greska pri proveri sponzor statusa",err)
            return false;
        }
    }
    async isChefBeginner(userId:number):Promise<boolean>{
        try{
            const user = await prisma.user.findUnique({
                where:{id:userId},
                include:{
                    ChefBeginner:true
                }
            });
            return !!user?.ChefBeginner;
        }
        catch(err){
            console.error("Greska pri proveri kuvar statursa", err);
            return false;
        }
    }
}