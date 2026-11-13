import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { AdController } from '@/lib/controllers/AdController';
import { SessionUser } from '@/lib/dtos';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

    // Await params prvo
    const resolvedParams = await params;
    const adId = parseInt(resolvedParams.id);
    
    if (isNaN(adId)) {
      return NextResponse.json({ error: 'Nevažeći ID reklame' }, { status: 400 });
    }

    const adController = new AdController();
    
    const existingAd = await adController.getAdWithStats(adId);
    if (!existingAd) {
      return NextResponse.json({ error: 'Reklama nije pronađena' }, { status: 404 });
    }
    const sessionUser = session.user as SessionUser;

    const sponsorId = sessionUser.id;
    if (!sessionUser.isAdmin && !sessionUser.isModerator && existingAd.sponsorId !== Number(sponsorId)) {
      return NextResponse.json({ error: 'Nemate pristup statistici ove reklame' }, { status: 403 });
    }

    const statistics = await adController.getStatistics(adId);
    return NextResponse.json(statistics);

  } catch (error: any) {
    console.error('Error fetching ad statistics:', error);
    return NextResponse.json(
      { error: error.message || 'Došlo je do greške pri učitavanju statistike' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

    // Await params prvo
    const resolvedParams = await params;
    const adId = parseInt(resolvedParams.id);
    
    if (isNaN(adId)) {
      return NextResponse.json({ error: 'Nevažeći ID reklame' }, { status: 400 });
    }

    const body = await request.json();
    const adController = new AdController();

    const existingAd = await adController.getAdWithStats(adId);
    if (!existingAd) {
      return NextResponse.json({ error: 'Reklama nije pronađena' }, { status: 404 });
    }
    const sessionUser = session.user as SessionUser;

    const sponsorId = sessionUser.id;
    if (!sessionUser.isAdmin && !sessionUser.isModerator && existingAd.sponsorId !== Number(sponsorId)) {
      return NextResponse.json({ error: 'Nemate pravo da menjate statistiku ove reklame' }, { status: 403 });
    }

    await adController.updateStatistics(body);
    
    return NextResponse.json({ message: 'Statistika uspešno ažurirana' });

  } catch (error: any) {
    console.error('Error updating ad statistics:', error);
    return NextResponse.json(
      { error: error.message || 'Došlo je do greške pri ažuriranju statistike' },
      { status: 500 }
    );
  }
}