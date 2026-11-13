import { NextRequest, NextResponse } from 'next/server';
import { RecipeController } from '@/lib/controllers/RecipeController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { UserController } from '@/lib/controllers/UserController';

export async function PUT( // ayuriranje bukmarka
  request: NextRequest,
  { params }: { params: Promise<{ userid: string; cookbookid: string; bookmarkid: string }> }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    // }

    // AWAIT PARAMS - OVO JE KLJUČNO!
    const { userid, cookbookid, bookmarkid } = await params;
    
    const bookmarkId = parseInt(bookmarkid);
    const body = await request.json();
    const { title, cookbookId } = body;

    if (isNaN(bookmarkId)) {
      return NextResponse.json({ error: 'Nevalidan ID bookmarka' }, { status: 400 });
    }

    const recipeController = new RecipeController();
    await recipeController.updateBookmark(bookmarkId, { title, cookbookId });

    return NextResponse.json({ success: true, message: 'Bookmark je ažuriran' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
export async function DELETE( // brisanje bukmarka
  request: NextRequest,
  { params }: { params: Promise<{ userid: string; cookbookid: string; bookmarkid: string }> }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    // }

    const { userid, cookbookid, bookmarkid } = await params;
    const userId = parseInt(userid);
    const cookbookId = parseInt(cookbookid);
    const bookmarkId = parseInt(bookmarkid);

    if (isNaN(userId) || isNaN(cookbookId) || isNaN(bookmarkId)) {
      return NextResponse.json({ error: 'Nevalidan ID' }, { status: 400 });
    }

    const userController = new UserController();
    await userController.deleteBookmarkFromCookbook(userId, cookbookId, bookmarkId);

    return NextResponse.json({ success: true, message: 'Bookmark je obrisan' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}