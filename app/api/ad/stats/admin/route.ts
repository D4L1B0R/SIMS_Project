import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { AdController } from '@/lib/controllers/AdController';
import { SessionUser } from '@/lib/dtos';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

    const sessionUser = session.user as SessionUser;

    if (!sessionUser.isAdmin) {
      return NextResponse.json({ error: 'Samo administratori mogu pristupiti ovim statistikama' }, { status: 403 });
    }

    const adController = new AdController();
    
    const allAds = await adController.getAllAds();
    
    const totalCosts = allAds.reduce((sum, ad) => sum + (ad.adStats?.ad_costs || 0), 0);
    const totalViews = allAds.reduce((sum, ad) => sum + (ad.adStats?.number_of_views || 0), 0);
    const totalRevenue = totalViews * adController.getRevenueFactor();
    
    const uniqueSponsors = new Set(allAds.map(ad => ad.sponsorId).filter(id => id !== undefined));
    
    const adminStats = {
      totalCosts,
      totalRevenue,
      totalViews,
      adsCount: allAds.length,
      sponsorsCount: uniqueSponsors.size,
      revenueFactor: adController.getRevenueFactor()
    };

    return NextResponse.json(adminStats);

  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri učitavanju administratorskih statistika' },
      { status: 500 }
    );
  }
}