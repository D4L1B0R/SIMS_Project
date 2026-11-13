import { UserController } from "@/lib/controllers/UserController";
import { SessionUser, UserDTO } from "@/lib/dtos";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const userController = new UserController();
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
     let user;
    
    if (id) {
      user = await userController.getById(Number(id));
    } else {
      user = await userController.getAll();
    }

    if (!user) {
      return Response.json(
        { error: "Korisnik nije pronađen" },
        { status: 404 }
      );
    }
    
    return Response.json(user, { status: 200 });

  } catch (err) {
    console.error("Greška pri dobijanju podataka o korisniku:", err);
    return Response.json(
      { error: "Greška pri dobijanju podataka o korisniku" },
      { status: 500 }
    );
  }
}export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as SessionUser | undefined;
    const sessionId = sessionUser?.id;
    
    const isAdmin = sessionUser?.isAdmin || false;
    const isSponsor = sessionUser?.isSponsor || false;


    if (!session || !sessionId) {
      return Response.json({ error: "Niste prijavljeni" }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return Response.json({ error: "Obavezan user ID" }, { status: 400 });
    }

    const sessionIdString = String(sessionId);
    
    if (!isAdmin && sessionIdString !== userId && !isSponsor) {
      // console.log('BLOCKED: User not authorized');
      return Response.json({
        error: "Možete ažurirati samo sopstveni profil"
      }, { status: 403 });
    }

    const existingUser = await userController.getById(Number(userId));
    if (!existingUser) {
      return Response.json({ error: "User nije pronađen" }, { status: 404 });
    }

    const updatedUser = { ...body, id: Number(userId) } as UserDTO;
    await userController.updateUser(updatedUser);

    return Response.json({
      message: "User uspešno ažuriran"
    }, { status: 200 });

  } catch (err) {
    console.error("Greška pri ažuriranju usera:", err);
    if (err instanceof Error && err.message.includes('Invalid')) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    return Response.json({ error: "Greška pri ažuriranju usera" }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as SessionUser | undefined;
    const sessionId = sessionUser?.id;
    
    const isAdmin = sessionUser?.isAdmin || false;
    const isModerator = sessionUser?.isModerator || false;

    // console.log('=== BACKEND DELETE SESSION ===');
    // console.log('Session user:', JSON.stringify(sessionUser, null, 2));
    // console.log('Session ID:', sessionId);
    // console.log('Is Admin:', isAdmin);
    // console.log('Is Moderator:', isModerator);

    if (!session || !sessionId) {
      return Response.json({ error: "Niste prijavljeni" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return Response.json({ error: "ID usera obavezan" }, { status: 400 });
    }

    const sessionIdString = String(sessionId);
    const canDeleteOtherUsers = isAdmin; 
    const canDeleteOwnAccount = sessionIdString === userId; 

    if (!canDeleteOtherUsers && !canDeleteOwnAccount) {
      return Response.json({
        error: "Možete obrisati samo sopstveni nalog"
      }, { status: 403 });
    }

    const existingUser = await userController.getById(Number(userId));
    if (!existingUser) {
      return Response.json({ error: "User nije pronađen" }, { status: 404 });
    }

    await userController.deleteUser(Number(userId));

    return Response.json({
      message: "User uspešno obrisan",
      redirect: !isAdmin
    }, { status: 200 });

  } catch (err) {
    console.error("Greška pri brisanju usera:", err);
    if (err instanceof Error) {
      if (err.message.includes('Invalid')) {
        return Response.json({ error: err.message }, { status: 400 });
      }
      if (err.message.includes('Foreign key constraint') || err.message.includes('constraint')) {
        return Response.json({
          error: "Ne možete obrisati nalog dok imate aktivne recepte ili druge povezane podatke. Molimo prvo obrišite sve recepte."
        }, { status: 409 });
      }
    }
    return Response.json({
      error: "Greška pri brisanju usera",
      details: err instanceof Error ? err.message : "Nepoznata greška"
    }, { status: 500 });
  }
}