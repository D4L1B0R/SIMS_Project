import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { UserController } from '@/lib/controllers/UserController';
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

    const userController = new UserController();
    const isAdmin = await userController.isAdmin(parseInt((session?.user as SessionUser)?.id));
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Samo administratori mogu da menjaju uloge' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { userId, role, privileged_user, pib, company_name } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'ID korisnika i uloga su obavezni' },
        { status: 400 }
      );
    }

    switch (role) {
      case 'moderator':
        await userController.setToModerator(userId);
        break;
      
      case 'administrator':
        await userController.setToAdmin(userId);
        break;
      
      case 'chefBeginner':
        await userController.setToChefBeginner(userId, privileged_user || false);
        break;
      
      case 'sponsor':
        if (!pib || !company_name) {
          return NextResponse.json(
            { error: 'PIB i naziv kompanije su obavezni za sponsora' },
            { status: 400 }
          );
        }
        await userController.setToSponsor(userId, pib, company_name);
        break;

      default:
        return NextResponse.json(
          { error: 'Nepoznata uloga' },
          { status: 400 }
        );
    }
    return NextResponse.json(
      { message: `Korisniku je uspešno dodeljena uloga: ${role}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Greška pri promeni uloge:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Došlo je do greške pri promeni uloge' },
      { status: 500 }
    );
  }
}