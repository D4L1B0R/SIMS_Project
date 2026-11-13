import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { RecipeController } from '@/lib/controllers/RecipeController';
import { SessionUser } from '@/lib/dtos';

export async function POST(request: NextRequest) {
  try {
    // console.log('=== RATE RECIPE API CALL ===');
    const session = await getServerSession(authOptions);
    
    if (!session || !(session?.user as SessionUser)?.id) {
      // console.log('No session found');
      return NextResponse.json(
        { error: 'Morate biti prijavljeni' },
        { status: 401 }
      );
    }

    // console.log('Session user ID:', session.user.id);

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');
    // console.log('Recipe ID:', recipeId);

    if (!recipeId) {
      return NextResponse.json(
        { error: 'ID recepta je obavezan' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating } = body;
    // console.log('Rating:', rating);


    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: 'Ocena je obavezna' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Ocena mora biti između 1 i 5' },
        { status: 400 }
      );
    }

    const recipeController = new RecipeController();
    
    const recipe = await recipeController.getById(parseInt(recipeId));
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recept nije pronađen' },
        { status: 404 }
      );
    }
    // console.log('Calling recipeController.rateRecipe...');
    await recipeController.rateRecipe(parseInt(recipeId), rating);
    // console.log('Recipe rated successfully');

    const averageRating = await recipeController.getRecipeRating(parseInt(recipeId));
    // console.log('Average rating:', averageRating);

    return NextResponse.json(
      { 
        message: 'Recept je uspešno ocenjen',
        averageRating 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Greška pri ocenjivanju:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Došlo je do greške pri ocenjivanju' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');

    if (!recipeId) {
      return NextResponse.json(
        { error: 'ID recepta je obavezan' },
        { status: 400 }
      );
    }

    const recipeController = new RecipeController();
    
    const recipe = await recipeController.getById(parseInt(recipeId));
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recept nije pronađen' },
        { status: 404 }
      );
    }

    const averageRating = await recipeController.getRecipeRating(parseInt(recipeId));
    const totalRatings = recipe.ratings?.length || 0;

    return NextResponse.json({
      averageRating,
      totalRatings,
      ratings: recipe.ratings || []
    });

  } catch (error) {
    console.error('Greška pri dobijanju ocena:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri dobijanju ocena' },
      { status: 500 }
    );
  }
}