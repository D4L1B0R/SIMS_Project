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
    // const session = await getServerSession(authOptions);
    
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    // }
    // const sessionUser = session.user as SessionUser;

    const resolvedParams = await params;
    const adId = parseInt(resolvedParams.id);
    
    if (isNaN(adId)) {
      return NextResponse.json({ error: 'Nevažeći ID reklame' }, { status: 400 });
    }

    const adController = new AdController();
    const ad = await adController.getAdWithStats(adId);

    if (!ad) {
      return NextResponse.json({ error: 'Reklama nije pronađena' }, { status: 404 });
    }

    // const sponsorId = sessionUser.id;
    // if (!sessionUser.isAdmin && !sessionUser.isModerator && ad.sponsorId !== Number(sponsorId)) {
    //   return NextResponse.json({ error: 'Nemate pristup ovoj reklami' }, { status: 403 });
    // }

    return NextResponse.json(ad);

  } catch (error) {
    console.error('Error fetching ad:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri učitavanju reklame' },
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
      return NextResponse.json({ error: 'Nemate pravo da menjate ovu reklamu' }, { status: 403 });
    }

    const updatedAd = {
      ...body,
      id: adId,
      sponsorId: existingAd.sponsorId 
    };

    await adController.updateAd(updatedAd);
    
    return NextResponse.json({ message: 'Reklama uspešno ažurirana' });

  } catch (error: any) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { error: error.message || 'Došlo je do greške pri ažuriranju reklame' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

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
      return NextResponse.json({ error: 'Nemate pravo da obrišete ovu reklamu' }, { status: 403 });
    }

    await adController.deleteAd(adId);
    
    return NextResponse.json({ message: 'Reklama uspešno obrisana' });

  } catch (error: any) {
    console.error('Error deleting ad:', error);
    return NextResponse.json(
      { error: error.message || 'Došlo je do greške pri brisanju reklame' },
      { status: 500 }
    );
  }
}