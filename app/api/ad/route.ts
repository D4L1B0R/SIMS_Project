import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { AdController } from '@/lib/controllers/AdController';
import { SessionUser } from '@/lib/dtos';

export async function GET(request: NextRequest,) {
  try {
    const session = await getServerSession(authOptions);
    

    let sessionUser;
    let sponsorId;
    if(session!== null){
      sessionUser = session.user as SessionUser;
      sponsorId = (session.user as SessionUser)?.id;
    }
    const adController = new AdController();
    if (sessionUser!== undefined && session!==null && sessionUser.isSponsor) {
      const ads = await adController.getAdsBySponsor(Number(sponsorId));
      return NextResponse.json(ads);
    }
    
    const ads = await adController.getAllAds();
    return NextResponse.json(ads);


  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri učitavanju reklama' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }
    const sessionUser = session.user as SessionUser;

    if (!sessionUser.isSponsor) {
      return NextResponse.json({ error: 'Samo sponzori mogu kreirati reklame' }, { status: 403 });
    }

    const body = await request.json();
    const adController = new AdController();

    const sponsorId = (session.user as SessionUser).id
    const adData = {
      ...body,
      sponsorId: Number(sponsorId),
      adStats: {
        ...body.adStats,
        ad_costs: body.adStats?.ad_costs || 100 
      }
    };

    await adController.addAd(adData);
    
    return NextResponse.json({ message: 'Reklama uspešno kreirana' }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: error.message || 'Došlo je do greške pri kreiranju reklame' },
      { status: 500 }
    );
  }
}