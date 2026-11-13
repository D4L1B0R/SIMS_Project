import { NextRequest, NextResponse } from 'next/server';
import { AdController } from '@/lib/controllers/AdController';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise first, then destructure
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const adId = parseInt(id);
    if (isNaN(adId)) {
      return NextResponse.json({ error: 'Nevažeći ID reklame' }, { status: 400 });
    }

    const adController = new AdController();
    await adController.incrementAdViews(adId);
    
    return NextResponse.json({ message: 'Pregled uspešno zabeležen' });

  } catch (error: any) {
    console.error('Error incrementing ad views:', error);
    return NextResponse.json(
      { error: error.message || 'Došlo je do greške pri beleženju pregleda' },
      { status: 500 }
    );
  }
}