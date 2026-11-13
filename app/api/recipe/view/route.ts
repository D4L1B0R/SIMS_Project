import { NextRequest } from 'next/server';
import { RecipeController } from '@/lib/controllers/RecipeController';

const recipeController = new RecipeController();

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: 'ID recepta je obavezan' }, { status: 400 });
    }

    await recipeController.incrementViewCount(Number(id));
    
    return Response.json({ 
      message: 'Broj pregleda uspešno povećan' 
    }, { status: 200 });

  } catch (err) {
    console.error('Greška pri povećanju broja pregleda:', err);
    return Response.json(
      { error: 'Greška pri povećanju broja pregleda' },
      { status: 500 }
    );
  }
}