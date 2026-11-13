import { prisma } from '@/prisma/prismaclient';
import { GenericRepository } from './GenericRepository';
import { Ad } from '../models/Ad';
import { AdStats } from '../models/AdStats';
import { Sponsor } from '../models/Sponsor';
import { User } from '../models/User';
import { Gender } from '../models/enums';

export class AdRepository extends GenericRepository<Ad> {
    protected prismaModel = prisma.ad;

    private mapToAdModel(prismaAd: any): Ad {
        if (!prismaAd.sponsor) {
            throw new Error(`Ad ${prismaAd.id} is missing sponsor`);
        }
        if (!prismaAd.sponsor.user) {
            throw new Error(`Sponsor ${prismaAd.sponsor.userId} is missing user`);
        }
        if (!prismaAd.adStats) {
            throw new Error(`Ad ${prismaAd.id} is missing adStats`);
        }

        const sponsorUser = new User({
            id: prismaAd.sponsor.user.id,
            gender: prismaAd.sponsor.user.gender as Gender,
            first_name: prismaAd.sponsor.user.first_name,
            last_name: prismaAd.sponsor.user.last_name,
            phone_number: prismaAd.sponsor.user.phone_number,
            date_of_birth: prismaAd.sponsor.user.date_of_birth,
            createdAt: prismaAd.sponsor.user.createdAt,
            updatedAt: prismaAd.sponsor.user.updatedAt
        });

        const sponsor = new Sponsor({
            id: prismaAd.sponsor.id,
            userId: prismaAd.sponsor.userId,
            pib: prismaAd.sponsor.pib,
            company_name: prismaAd.sponsor.company_name,
            user: sponsorUser
        });

        const adStats = new AdStats({
            id: prismaAd.adStats.id,
            ad_costs: prismaAd.adStats.ad_costs,
            number_of_views: prismaAd.adStats.number_of_views,
            revenue: prismaAd.adStats.revenue,
            sponsorId: prismaAd.adStats.sponsorId,
            sponsor: sponsor 
        });

        return new Ad({
            id: prismaAd.id,
            resource_url: prismaAd.resource_url,
            description: prismaAd.description,
            sponsorId: prismaAd.sponsorId,
            adStatsId: prismaAd.adStatsId,
            sponsor: sponsor,
            adStats: adStats
        });
    }

    async getAll(): Promise<Ad[]> {
        const ads = await this.prismaModel.findMany({
            include: {
                sponsor: {
                    include:{
                        user:true,
                    }
                },
                adStats: true
            }
        });
        return ads.map(ad => this.mapToAdModel(ad));
    }

    async getById(id: number): Promise<Ad | null> {
        const ad = await this.prismaModel.findUnique({
            where: { id },
            include: {
                sponsor: {include:{
                    user: true,
                }},
                adStats: true
            }
        });
        return ad ? this.mapToAdModel(ad) : null;
    }

    async findByExpression(expression: any): Promise<Ad[]> {
        const ads = await this.prismaModel.findMany({
            where: expression,
            include: {
                sponsor: {
                    include:{
                        user:true,
                    },
                },
                adStats: true
            }
        });
        return ads.map(ad => this.mapToAdModel(ad));
    }
    
    async add(entity: Ad): Promise<void> {
        if (!entity.isValid()) {
            throw new Error('Invalid Ad entity');
        }

        await prisma.$transaction(async (tx) => {
            const adStats = await tx.adStats.create({
            data: {
                ad_costs: entity.adStats?.ad_costs || 100, 
                number_of_views: 0, 
                revenue: 0, 
                sponsorId: entity.sponsorId
            }
            });

            await tx.ad.create({
            data: {
                resource_url: entity.resource_url,
                description: entity.description,
                sponsorId: entity.sponsorId,
                adStatsId: adStats.id
            }
            });
        });
        }

    async update(entity: Ad): Promise<void> {
        if (!entity.isValid()) {
            throw new Error('Invalid Ad entity');
        }

        await prisma.$transaction(async (tx) => {
            await tx.ad.update({
                where: { id: entity.id },
                data: {
                    resource_url: entity.resource_url,
                    description: entity.description,
                    sponsorId: entity.sponsorId
                }
            });

            if (entity.adStats && entity.adStatsId) {
                await tx.adStats.update({
                    where: { id: entity.adStatsId },
                    data: {
                        ad_costs: entity.adStats.ad_costs,
                        number_of_views: entity.adStats.number_of_views,
                        revenue: entity.adStats.revenue,
                        sponsorId: entity.sponsorId
                    }
                });
            }
        });
    }

    async delete(id: number): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const ad = await tx.ad.findUnique({
                where: { id },
                select: { adStatsId: true }
            });

            if (ad) {
                await tx.ad.delete({
                    where: { id }
                });

                if (ad.adStatsId) {
                    await tx.adStats.delete({
                        where: { id: ad.adStatsId }
                    });
                }
            }
        });
    }

    async getStatistics(id: number): Promise<AdStats> {
        const ad = await this.prismaModel.findUnique({
            where: { id },
            include: {
                adStats: {
                    include: {
                        sponsor: {
                            include: {
                                user: true,
                            }
                        }
                    }
                }
            }
        });

        if (!ad || !ad.adStats) {
            throw new Error(`Statistics not found for ad with ID: ${id}`);
        }

        if (!ad.adStats.sponsor) {
            throw new Error(`AdStats ${ad.adStats.id} is missing sponsor`);
        }
        if (!ad.adStats.sponsor.user) {
            throw new Error(`AdStats sponsor ${ad.adStats.sponsor.userId} is missing user`);
        }

        const user = new User({
            id: ad.adStats.sponsor.user.id,
            gender: ad.adStats.sponsor.user.gender as Gender,
            first_name: ad.adStats.sponsor.user.first_name,
            last_name: ad.adStats.sponsor.user.last_name,
            phone_number: ad.adStats.sponsor.user.phone_number,
            date_of_birth: ad.adStats.sponsor.user.date_of_birth,
            createdAt: ad.adStats.sponsor.user.createdAt,
            updatedAt: ad.adStats.sponsor.user.updatedAt
        });

        const sponsor = new Sponsor({
            id: ad.adStats.sponsor.user.id,
            gender: ad.adStats.sponsor.user.gender as Gender,
            first_name: ad.adStats.sponsor.user.first_name,
            last_name: ad.adStats.sponsor.user.last_name,
            phone_number: ad.adStats.sponsor.user.phone_number,
            date_of_birth: ad.adStats.sponsor.user.date_of_birth,
            createdAt: ad.adStats.sponsor.user.createdAt,
            updatedAt: ad.adStats.sponsor.user.updatedAt,
            
            userId: ad.adStats.sponsor.userId,
            pib: ad.adStats.sponsor.pib,
            company_name: ad.adStats.sponsor.company_name,
            user: user 
        });

        return new AdStats({
            id: ad.adStats.id,
            ad_costs: ad.adStats.ad_costs,
            number_of_views: ad.adStats.number_of_views,
            revenue: ad.adStats.revenue,
            sponsorId: ad.adStats.sponsorId,
            sponsor: sponsor
        });
    }

    async deleteStatistics(id: number): Promise<void> {
        const ad = await this.getById(id);
        
        if (ad && ad.adStatsId) {
            await prisma.adStats.delete({
                where: { id: ad.adStatsId }
            });
        }
    }

    async updateStatistics(stats: AdStats): Promise<void> {
        if (!stats.isValid()) {
            throw new Error('Invalid AdStats entity');
        }

        await prisma.adStats.update({
            where: { id: stats.id },
            data: {
                ad_costs: stats.ad_costs,
                number_of_views: stats.number_of_views,
                revenue: stats.revenue,
                sponsorId: stats.sponsorId
            }
        });
    }

    async getAdsBySponsor(sponsorId: number): Promise<Ad[]> {
    const ads = await this.prismaModel.findMany({
        where: { 
            sponsor: {
                userId: sponsorId 
            }
        },
        include: {
            sponsor: {
                include: {
                    user: true 
                }
            },
            adStats: {
                include: {
                    sponsor: {
                        include: {
                            user: true 
                        }
                    }
                }
            }
        }
    });
    return ads.map(ad => this.mapToAdModel(ad));
}
    async incrementAdViews(adId: number): Promise<void> {
        const ad = await this.getById(adId);
        
        if (ad && ad.adStatsId) {
            await prisma.adStats.update({
                where: { id: ad.adStatsId },
                data: {
                    number_of_views: {
                        increment: 1
                    }
                }
            });
        }
    }

    async getTopPerformingAds(limit: number = 10): Promise<Ad[]> {
        const ads = await this.prismaModel.findMany({
            include: {
                sponsor: true,
                adStats: true
            },
            orderBy: {
                adStats: {
                    revenue: 'desc'
                }
            },
            take: limit
        });
        return ads.map(ad => this.mapToAdModel(ad));
    }

    async getAdsByCostRange(minCost: number, maxCost: number): Promise<Ad[]> {
        const ads = await this.prismaModel.findMany({
            where: {
                adStats: {
                    ad_costs: {
                        gte: minCost,
                        lte: maxCost
                    }
                }
            },
            include: {
                sponsor: true,
                adStats: true
            }
        });
        return ads.map(ad => this.mapToAdModel(ad));
    }

}