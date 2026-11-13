import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/lib/controllers/UserController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userid: string; cookbookid: string }> } 
) {
  try{
    const params = await context.params;
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    // }

    const userId = parseInt(params.userid);
    const cookbookId = parseInt(params.cookbookid);
    
    if (isNaN(userId) || isNaN(cookbookId)) {
      return NextResponse.json({ error: 'Nevalidan ID' }, { status: 400 });
    }

    const userController = new UserController();
    const cookbook = await userController.getUserCookbookWithRecipes(userId, cookbookId);
    
    if (!cookbook) {
      return NextResponse.json({ error: 'Cookbook nije pronađen' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: cookbook });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userid: string; cookbookid: string }> }
) {
  try {
    const params = await context.params;
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    // }

    const userId = parseInt(params.userid);
    const cookbookId = parseInt(params.cookbookid);
    const body = await request.json();
    const { title, description } = body;

    if (isNaN(userId) || isNaN(cookbookId)) {
      return NextResponse.json({ error: 'Nevalidan ID' }, { status: 400 });
    }

    const userController = new UserController();
    const updatedCookbook = await userController.updateUserCookbook(userId, cookbookId, {
      title,
      description
    });

    return NextResponse.json({ success: true, data: updatedCookbook });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userid: string; cookbookid: string }> }
) {
  try {
    const params = await context.params;
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
    // }

    const userId = parseInt(params.userid);
    const cookbookId = parseInt(params.cookbookid);

    if (isNaN(userId) || isNaN(cookbookId)) {
      return NextResponse.json({ error: 'Nevalidan ID' }, { status: 400 });
    }

    const userController = new UserController();
    await userController.deleteUserCookbook(userId, cookbookId);

    return NextResponse.json({ success: true, message: 'Cookbook je obrisan' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}