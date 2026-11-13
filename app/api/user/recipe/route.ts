import { NextRequest } from "next/server";
import { UserController } from "@/lib/controllers/UserController";

const userController = new UserController();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return Response.json(
        { error: "ID korisnika je obavezan" },
        { status: 400 }
      );
    }

    const recipes = await userController.getUserRecipes(Number(userId));
    return Response.json(recipes, { status: 200 });
    
  } catch (err) {
    console.error('Error in user recipes API:', err);
    return Response.json({ 
      error: "Greška pri dohvatanju recepata korisnika",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}