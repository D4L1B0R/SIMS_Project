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
    const sponsorId = sessionUser.id;

    if (!sessionUser.isSponsor) {
      return NextResponse.json({ error: 'Samo sponzori mogu pristupiti statistikama' }, { status: 403 });
    }

    const adController = new AdController();
    const aggregatedStats = await adController.getSponsorAggregatedStats(Number(sponsorId));

    const response = {
      ...aggregatedStats,
      revenueFactor: adController.getRevenueFactor()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching aggregated stats:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri učitavanju statistikа' },
      { status: 500 }
    );
  }
}