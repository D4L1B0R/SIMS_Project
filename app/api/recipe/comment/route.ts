import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { RecipeController } from '@/lib/controllers/RecipeController';
import { SessionUser } from '@/lib/dtos';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session?.user as SessionUser)?.id) {
      return NextResponse.json(
        { error: 'Morate biti prijavljeni' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');

    if (!recipeId) {
      return NextResponse.json(
        { error: 'ID recepta je obavezan' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tekst komentara je obavezan' },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Komentar ne može biti duži od 1000 karaktera' },
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

    await recipeController.commentRecipe(parseInt(recipeId), text.trim());

    return NextResponse.json(
      { message: 'Komentar je uspešno dodat' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Greška pri komentarisanju:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Došlo je do greške pri komentarisanju' },
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

    const comments = await recipeController.getRecipeComments(parseInt(recipeId));

    return NextResponse.json({
      comments: comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt,
        chefBeginnerId: comment.chefBeginnerId,
        chefBeginner: comment.chefBeginner ? {
          id: comment.chefBeginner.id,
          privileged_user: comment.chefBeginner.privileged_user,
          user: comment.chefBeginner.user ? {
            id: comment.chefBeginner.user.id,
            first_name: comment.chefBeginner.user.first_name,
            last_name: comment.chefBeginner.user.last_name
          } : undefined
        } : undefined
      }))
    });

  } catch (error) {
    console.error('Greška pri dobijanju komentara:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri dobijanju komentara' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session?.user as SessionUser)?.id) {
      return NextResponse.json(
        { error: 'Morate biti prijavljeni' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json(
        { error: 'ID komentara je obavezan' },
        { status: 400 }
      );
    }

    //????????????
    

    return NextResponse.json(
      { error: 'Brisanje komentara još uvek nije implementirano' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Greška pri brisanju komentara:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri brisanju komentara' },
      { status: 500 }
    );
  }
}