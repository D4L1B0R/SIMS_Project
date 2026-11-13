import { NextRequest, NextResponse } from 'next/server';
import { RecipeController } from '@/lib/controllers/RecipeController';
import { UserController } from '@/lib/controllers/UserController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { SessionUser } from '@/lib/dtos';

export async function GET(request: NextRequest) {  //dobavljanje u kojim je
    //cookbookovima usera sacuvan recept
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recipeId = parseInt(searchParams.get('recipeId') || '');

    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Nevalidan ID recepta' }, { status: 400 });
    }

    const userController = new UserController();
    const recipeController = new RecipeController();

    const userId = parseInt((session?.user as SessionUser)?.id); 
    // const userId=11;

    const user = await userController.getById(userId);
    if (!user || !user.chefBeginner) {
      return NextResponse.json({ error: 'Samo kuvari mogu da bookmarkuju recepte' }, { status: 403 });
    }
    const cookbooks = await userController.getUserCookbooksWithRecipes(userId);

    const bookmarksInfo = await recipeController.getRecipeBookmarksInfo(recipeId, user.chefBeginner.id);

    const response = {
      success: true,
      data: {
        recipeId: recipeId,
        userCookbooks: cookbooks.map(cookbook => ({
          id: cookbook.id,
          title: cookbook.title,
          description: cookbook.description,
          isBookmarked: bookmarksInfo.some(b => b.cookbookId === cookbook.id),
          bookmarkId: bookmarksInfo.find(b => b.cookbookId === cookbook.id)?.id
        })),
        totalBookmarks: bookmarksInfo.length
      }
    };

    return NextResponse.json(response);
    //  return NextResponse.json(bookmarksInfo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) { //bukmarkovanje u jedan ili vise cookbookoca
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

    const body = await request.json();
    const { recipeId, cookbookIds, title } = body;

    if (!recipeId || isNaN(Number(recipeId))) {
      return NextResponse.json({ error: 'Nevalidan ID recepta' }, { status: 400 });
    }

    if (!cookbookIds || !Array.isArray(cookbookIds) || cookbookIds.length === 0) {
      return NextResponse.json({ error: 'Morate izabrati bar jedan cookbook' }, { status: 400 });
    }

    const numericCookbookIds = cookbookIds.map(id => Number(id));
    if (numericCookbookIds.some(id => isNaN(id))) {
      return NextResponse.json({ error: 'Nevalidan ID cookbooka' }, { status: 400 });
    }

    const numericRecipeId = Number(recipeId);
    const recipeController = new RecipeController();

    const userId = parseInt((session?.user as SessionUser)?.id); 

    await recipeController.bookmarkRecipe(numericRecipeId, numericCookbookIds, title);

    return NextResponse.json({ 
      success: true, 
      message: 'Recept je uspešno bookmarkovan',
      data: {
        recipeId: numericRecipeId,
        cookbookIds: numericCookbookIds
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      recipeId,
      cookbookIdsToAdd = [], 
      cookbookIdsToRemove = [],
      title 
    } = body;

    if (!recipeId || isNaN(Number(recipeId))) {
      return NextResponse.json({ error: 'Nevalidan ID recepta' }, { status: 400 });
    }

    const numericCookbookIdsToAdd = cookbookIdsToAdd.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
    const numericCookbookIdsToRemove = cookbookIdsToRemove.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));

    if (numericCookbookIdsToAdd.length === 0 && numericCookbookIdsToRemove.length === 0) {
      return NextResponse.json({ error: 'Nema cookbookova za ažuriranje' }, { status: 400 });
    }

    const numericRecipeId = Number(recipeId);
    const recipeController = new RecipeController();

    // const userId = session.user.id;
    const userId = parseInt((session?.user as SessionUser)?.id); 

    let addedResults = [];
    let removedResults = [];

    if (numericCookbookIdsToAdd.length > 0) {
      for (const cookbookId of numericCookbookIdsToAdd) {
        try {
          const result = await recipeController.bookmarkRecipeInCookbook(
            numericRecipeId, 
            cookbookId, 
            title
          );
          addedResults.push({ cookbookId, success: true });
        } catch (error) {
          addedResults.push({ cookbookId, success: false, error: error });
        }
      }
    }

    if (numericCookbookIdsToRemove.length > 0) {
      for (const cookbookId of numericCookbookIdsToRemove) {
        try {
          const result = await recipeController.removeBookmarkFromCookbook(
            numericRecipeId, 
            cookbookId
          );
          removedResults.push({ cookbookId, success: true });
        } catch (error) {
          removedResults.push({ cookbookId, success: false, error: error });
        }
      }
    }

    const successfulAdds = addedResults.filter(r => r.success);
    const successfulRemoves = removedResults.filter(r => r.success);

    return NextResponse.json({ 
      success: true, 
      message: `Bookmarkovi ažurirani. Uspešno dodato: ${successfulAdds.length}, uspešno uklonjeno: ${successfulRemoves.length}`,
      data: {
        addedToCookbooks: numericCookbookIdsToAdd,
        removedFromCookbooks: numericCookbookIdsToRemove,
        addedResults: addedResults,
        removedResults: removedResults,
        bookmarksAdded: successfulAdds.length,
        bookmarksRemoved: successfulRemoves.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) { //brisanje recepta iz svih bukmarkova
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recipeId = parseInt(searchParams.get('recipeId') || '');

    if (isNaN(recipeId)) {
      return NextResponse.json({ error: 'Nevalidan ID recepta' }, { status: 400 });
    }

    const recipeController = new RecipeController();

    // const userId = session.user.id; 
    const userId = parseInt((session?.user as SessionUser)?.id); 

    const result = await recipeController.removeBookmarkFromAllCookbooks(recipeId);

    return NextResponse.json({ 
      success: true, 
      message: 'Bookmark je uklonjen iz svih cookbookova',
      data: {
        bookmarksRemoved: result
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}