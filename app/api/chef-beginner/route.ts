import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/prisma/prismaclient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID je obavezan' },
        { status: 400 }
      );
    }

    const chefBeginner = await prisma.chefBeginner.findFirst({
      where: {
        userId: parseInt(userId)
      },
      select: {
        id: true,
        privileged_user: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (!chefBeginner) {
      return NextResponse.json(
        { error: 'Korisnik nije registrovan kao kuvar' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      chefBeginner
    });

  } catch (error) {
    console.error('Greška pri pronalaženju chefBeginner-a:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri pronalaženju kuvara' },
      { status: 500 }
    );
  }
}