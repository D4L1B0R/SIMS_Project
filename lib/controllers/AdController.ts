import { GenericController } from './GenericController';
import { AdRepository } from '../repositories/AdRepository';
import { Ad } from '../models/Ad';
import { AdDTO, AdStatsDTO, SponsorDTO, UserDTO } from '../dtos';
import { AdStats } from '../models/AdStats';
import { Sponsor } from '../models/Sponsor';
import { User } from '../models/User';

export class AdController extends GenericController<Ad, AdDTO> {
  private adRepository: AdRepository;
  private readonly REVENUE_FACTOR = 0.1; 

  constructor() {
    super(new AdRepository());
    this.adRepository = new AdRepository();
  }

  translateDTO(dto: AdDTO): Ad {
    return new Ad({
      id: dto.id,
      resource_url: dto.resource_url,
      description: dto.description,
      sponsorId: dto.sponsorId,
      adStatsId: dto.adStatsId,
      sponsor: dto.sponsor ? new Sponsor({
        id: dto.sponsor.id,
        userId: dto.sponsor.userId,
        pib: dto.sponsor.pib,
        company_name: dto.sponsor.company_name
      }) : undefined,
      adStats: dto.adStats ? new AdStats({
        id: dto.adStats.id,
        ad_costs: dto.adStats.ad_costs,
        number_of_views: dto.adStats.number_of_views,
        revenue: dto.adStats.revenue,
        sponsorId: dto.adStats.sponsorId
      }) : undefined
    });
  }

  translateModel(model: Ad): AdDTO {
    if (!model.sponsor) {
      throw new Error('Ad must have a sponsor');
    }
    if (!model.sponsor.user) {
      throw new Error('Sponsor must have a user');
    }
    if (!model.adStats) {
      throw new Error('Ad must have ad statistics');
    }

    const mapUserToDTO = (user: User): UserDTO => {
      return {
        id: user.id,
        gender: user.gender,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        date_of_birth: user.date_of_birth,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: undefined,
        chefBeginner: undefined,
        sponsor: undefined,
        moderator: undefined
      };
    };

    const mapSponsorToDTO = (sponsor: Sponsor): SponsorDTO => {
      if (!sponsor.user) {
        throw new Error('Sponsor must have a user');
      }
      
      const userDTO = mapUserToDTO(sponsor.user);
      
      return {
        id: userDTO.id,
        gender: userDTO.gender,
        first_name: userDTO.first_name,
        last_name: userDTO.last_name,
        phone_number: userDTO.phone_number,
        date_of_birth: userDTO.date_of_birth,
        createdAt: userDTO.createdAt,
        updatedAt: userDTO.updatedAt,
        profile: userDTO.profile,
        chefBeginner: userDTO.chefBeginner,
        sponsor: userDTO.sponsor,
        moderator: userDTO.moderator,
        
        userId: sponsor.userId,
        pib: sponsor.pib,
        company_name: sponsor.company_name,
        user: userDTO,
        recipes: [],
        ads: [],
        adStats: []
      };
    };

    const mapAdStatsToDTO = (stats: AdStats): AdStatsDTO => {
      const calculatedRevenue = stats.number_of_views * this.REVENUE_FACTOR;
      
      return {
        id: stats.id,
        ad_costs: stats.ad_costs,
        number_of_views: stats.number_of_views,
        revenue: calculatedRevenue, 
        sponsorId: stats.sponsorId,
        sponsor: mapSponsorToDTO(model.sponsor),
        ad: undefined,
        recipes: []
      };
    };

    return {
      id: model.id,
      resource_url: model.resource_url,
      description: model.description,
      sponsorId: model.sponsorId,
      adStatsId: model.adStatsId,
      sponsor: mapSponsorToDTO(model.sponsor),
      adStats: mapAdStatsToDTO(model.adStats)
    };
  }

  verifyDTO(dto: AdDTO): boolean {
    const ad = this.translateDTO(dto);
    return ad.isValid();
  }

  async getStatistics(id: number): Promise<AdStatsDTO> {
    const stats = await this.adRepository.getStatistics(id);
    
    const mapUserToDTO = (user: User): UserDTO => {
      return {
        id: user.id,
        gender: user.gender,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        date_of_birth: user.date_of_birth,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: undefined,
        chefBeginner: undefined,
        sponsor: undefined,
        moderator: undefined
      };
    };

    const mapSponsorToDTO = (sponsor: Sponsor): SponsorDTO => {
      if (!sponsor.user) {
        throw new Error('Sponsor must have a user');
      }
      
      const userDTO = mapUserToDTO(sponsor.user);
      
      return {
        id: userDTO.id,
        gender: userDTO.gender,
        first_name: userDTO.first_name,
        last_name: userDTO.last_name,
        phone_number: userDTO.phone_number,
        date_of_birth: userDTO.date_of_birth,
        createdAt: userDTO.createdAt,
        updatedAt: userDTO.updatedAt,
        profile: userDTO.profile,
        chefBeginner: userDTO.chefBeginner,
        sponsor: userDTO.sponsor,
        moderator: userDTO.moderator,
        
        userId: sponsor.userId,
        pib: sponsor.pib,
        company_name: sponsor.company_name,
        user: userDTO,
        recipes: [],
        ads: [],
        adStats: []
      };
    };

    if (!stats.sponsor) {
      throw new Error('AdStats must have a sponsor');
    }

    const calculatedRevenue = stats.number_of_views * this.REVENUE_FACTOR;

    return {
      id: stats.id,
      ad_costs: stats.ad_costs,
      number_of_views: stats.number_of_views,
      revenue: calculatedRevenue, 
      sponsorId: stats.sponsorId,
      sponsor: mapSponsorToDTO(stats.sponsor),
      ad: undefined,
      recipes: []
    };
  }

  async getSponsorAggregatedStats(sponsorId: number): Promise<{
    totalCosts: number;
    totalRevenue: number;
    totalViews: number;
    adsCount: number;
  }> {
    const ads = await this.adRepository.getAdsBySponsor(sponsorId);
    
    let totalCosts = 0;
    let totalViews = 0;
    let adsCount = ads.length;

    for (const ad of ads) {
      if (ad.adStats) {
        totalCosts += ad.adStats.ad_costs;
        totalViews += ad.adStats.number_of_views;
      }
    }

    const totalRevenue = totalViews * this.REVENUE_FACTOR;

    return {
      totalCosts,
      totalRevenue,
      totalViews,
      adsCount
    };
  }

  async addAd(adDTO: AdDTO): Promise<void> {
    if (!this.verifyDTO(adDTO)) {
      throw new Error('Invalid ad data');
    }

    const ad = this.translateDTO(adDTO);
    const initialCost = adDTO.adStats?.ad_costs || 100;
  
    if (ad.adStats) {
      ad.adStats.ad_costs = initialCost; 
      ad.adStats.number_of_views = 0; 
      ad.adStats.revenue = 0; 
    }
    await this.adRepository.add(ad);
  }

  async updateAd(adDTO: AdDTO): Promise<void> {
    if (!this.verifyDTO(adDTO)) {
      throw new Error('Invalid ad data');
    }

    if(adDTO.id){
      const existingAd = await this.adRepository.getById(adDTO.id);
      if (!existingAd) {
        throw new Error('Ad not found');
      }

      const ad = this.translateDTO(adDTO);
      if (ad.adStats && existingAd.adStats) {
        ad.adStats.number_of_views = existingAd.adStats.number_of_views;
      }
      await this.adRepository.update(ad);
      
    }
    else{
      throw new Error('ne postoji id ad')
    }
  }

  async deleteAd(id: number): Promise<void> {
    const existingAd = await this.adRepository.getById(id);
    if (!existingAd) {
      throw new Error('Ad not found');
    }

    await this.adRepository.delete(id);
  }

  async updateStatistics(statsDTO: AdStatsDTO): Promise<void> {
    const stats = new AdStats({
      id: statsDTO.id,
      ad_costs: statsDTO.ad_costs,
      number_of_views: statsDTO.number_of_views,
      revenue: statsDTO.revenue,
      sponsorId: statsDTO.sponsorId
    });

    if (!stats.isValid()) {
      throw new Error('Invalid statistics data');
    }

    await this.adRepository.updateStatistics(stats);
  }

  async deleteStatistics(id: number): Promise<void> {
    await this.adRepository.deleteStatistics(id);
  }

  async getAdsBySponsor(sponsorId: number): Promise<AdDTO[]> {
    const ads = await this.adRepository.getAdsBySponsor(sponsorId);
    return ads.map(ad => this.translateModel(ad));
  }

  async getTopPerformingAds(limit: number = 10): Promise<AdDTO[]> {
    const ads = await this.adRepository.getTopPerformingAds(limit);
    return ads.map(ad => this.translateModel(ad));
  }

  async incrementAdViews(id: number): Promise<void> {
    await this.adRepository.incrementAdViews(id);
  }

  async getAdsByCostRange(minCost: number, maxCost: number): Promise<AdDTO[]> {
    const ads = await this.adRepository.getAdsByCostRange(minCost, maxCost);
    return ads.map(ad => this.translateModel(ad));
  }

  async getAdWithStats(id: number): Promise<AdDTO | null> {
    const ad = await this.adRepository.getById(id);
    return ad ? this.translateModel(ad) : null;
  }

  async getAllAds(): Promise<AdDTO[]> {
    const ads = await this.adRepository.getAll();
    return ads.map(ad => this.translateModel(ad));
  }

  async searchAds(query: string): Promise<AdDTO[]> {
    const allAds = await this.getAllAds();
    return allAds.filter(ad => 
      ad.description.toLowerCase().includes(query.toLowerCase()) ||
      ad.resource_url.toLowerCase().includes(query.toLowerCase())
    );
  }

  getRevenueFactor(): number {
    return this.REVENUE_FACTOR;
  }
}