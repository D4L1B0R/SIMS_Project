import { NextRequest, NextResponse } from 'next/server';
import { RecipeController } from '@/lib/controllers/RecipeController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { UserController } from '@/lib/controllers/UserController';

export async function GET( //dobavljanje svih bukmarkov au cookbooku
  request: NextRequest,
  context: { params: Promise<{ userid: string; cookbookid: string }> }
) {
  try {
    const params = await context.params;
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    // }

    const cookbookId = parseInt(params.cookbookid);
    
    if (isNaN(cookbookId)) {
      return NextResponse.json({ error: 'Nevalidan ID cookbooka' }, { status: 400 });
    }

    const userController = new UserController();
    const bookmarks = await userController.getBookmarksByCookbook(cookbookId);
    
    return NextResponse.json({ success: true, data: bookmarks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


export async function POST( // kreiranje bukmarka
  request: NextRequest,
  context: { params: Promise<{ userid: string; cookbookid: string }> }
) {
  try {
    const params = await context.params;  
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    // }

    const cookbookId = parseInt(params.cookbookid);
    const body = await request.json();
    const { recipeId, title } = body;

    const numericRecipeId = parseInt(recipeId)
    if (isNaN(cookbookId)) {
      return NextResponse.json({ error: 'Nevalidan ID cookbooka' }, { status: 400 });
    }

    if (!recipeId) {
      return NextResponse.json({ error: 'ID recepta je obavezan' }, { status: 400 });
    }

    const recipeController = new RecipeController();
    await recipeController.bookmarkRecipeInCookbook(numericRecipeId, cookbookId, title);

    return NextResponse.json({ success: true, message: 'Recept je dodat u cookbook' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}