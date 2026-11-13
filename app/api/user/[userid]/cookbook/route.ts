import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/lib/controllers/UserController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(  // vraca sve cookbookove korisnika
  request: NextRequest,
  context: { params: Promise<{ userid: string;}> }
) {
  try {
    const params = await context.params;
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

    const userId = parseInt(params.userid);
    if (isNaN(userId)) return NextResponse.json({ error: 'Nevalidan ID korisnika' }, { status: 400 });

    const userController = new UserController();
    const cookbooks = await userController.getUserCookbooksWithRecipes(userId);
    return NextResponse.json({ success: true, data: cookbooks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST( // kreira novi cookbook korisnika, mora da se prosledi title i description
  request: NextRequest,
  context: { params: Promise<{ userid: string;}> }
) {
  try {
    const params = await context.params;
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });

    const userId = parseInt(params.userid);
    const body = await request.json();
    const { title, description } = body;

    if (isNaN(userId)) return NextResponse.json({ error: 'Nevalidan ID korisnika' }, { status: 400 });
    if (!title) return NextResponse.json({ error: 'Naslov je obavezan' }, { status: 400 });

    const userController = new UserController();
    const cookbook = await userController.createUserCookbook(userId, { title, description });

    return NextResponse.json({ success: true, data: cookbook });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}