import { NextRequest } from "next/server";
import { RecipeController } from "@/lib/controllers/RecipeController";
import { RecipeDTO } from "@/lib/dtos";
import { UserController } from "@/lib/controllers/UserController";
import { Category, Heaviness } from "@/lib/models/enums";

const recipeController = new RecipeController();
const userController = new UserController();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const category = searchParams.get('category');
    const heaviness = searchParams.get('heaviness');

    const startTime = parseInt(searchParams.get('startTime') as string);
    const endTime = parseInt(searchParams.get('endTime') as string);

    const startNumber = parseInt(searchParams.get('startNumber') as string);
    const endNumber = parseInt(searchParams.get('endNumber') as string);

    const search = searchParams.get('search');
    const chefBeginnerId = searchParams.get('chefBeginnerId');
    
    // PRETRAGA PO ID
     if (id) {
      const recipe = await recipeController.getById(Number(id));
      if (!recipe) {
        return Response.json({ error: "Recept nije pronađen" }, { status: 404 });
      }
      return Response.json(recipe, { status: 200 });
    }
    
    let recipes: RecipeDTO[] = [];

    recipes = await recipeController.findByAnything({ category: category as Category, heaviness: heaviness as Heaviness, startNumber, endNumber, startTime, endTime, search })
    
    //FALI KOMBINOVANJE FILTERA
    //PRETRAGA PO TITLU ILI SVIH RECEPATA
    if (chefBeginnerId) {
      recipes = await recipeController.findByChefBeginnerId(Number(chefBeginnerId));
    }

    // if(heaviness) {
    //   recipes = await recipeController.findByHeaviness(heaviness as Heaviness)
    // }

    // if (category) {
    //   recipes = await recipeController.findByCategory(category as Category);
    // }

    // if(startTime && endTime) {
    //   recipes = await recipeController.findByPreparationTime(startTime, endTime);
    // }

    // if(startNumber && endNumber) {
    //   recipes = await recipeController.findByNumberOfPortions(startNumber, endNumber);
    // }
    
    return Response.json(recipes, { status: 200 });
    
  } catch (err) {
    console.error('Error in recipe API:', err);
    return Response.json({ 
      error: "Greška pri dohvatanju recepata",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await userController.addRecipe(body as RecipeDTO);
    
    return Response.json({
      message: "Recept je uspešno kreiran"
    }, { status: 201 });
    
  } catch (err) {
    console.error("Greška pri kreiranju recepta:", err);
    
    if (err instanceof Error) {
      if (err.message.includes('Invalid')) {
        return Response.json({ error: err.message }, { status: 400 });
      }
    }
    
    return Response.json({ error: "Greška pri kreiranju recepta" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');
    
    if (!recipeId ) {
      return Response.json({ 
        error: "ID recepta su obavezni" 
      }, { status: 400 });
    }
    
    const existingRecipe = await recipeController.getById(Number(recipeId));
    if (!existingRecipe) {
      return Response.json({ error: "Recept nije pronađen" }, { status: 404 });
    }
    
    // if (existingRecipe.chefBeginnerId !== Number(chefBeginnerId)) {
    //   return Response.json({ 
    //     error: "Samo kreator recepta može da ga ažurira" 
    //   }, { status: 403 });
    // }
    
    const updatedRecipe = { ...body, id: Number(recipeId) } as RecipeDTO;
    await recipeController.updateRecipe(updatedRecipe);
    
    return Response.json({
      message: "Recept je uspešno ažuriran"
    }, { status: 200 });
    
  } catch (err) {
    console.error("Greška pri ažuriranju recepta:", err);
    
    if (err instanceof Error) {
      if (err.message.includes('Invalid')) {
        return Response.json({ error: err.message }, { status: 400 });
      }
    }
    
    return Response.json({ error: "Greška pri ažuriranju recepta" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');
    
    if (!recipeId ) {
      return Response.json({ 
        error: "ID recepta su obavezni" 
      }, { status: 400 });
    }
    
    const existingRecipe = await recipeController.getById(Number(recipeId));
    if (!existingRecipe) {
      return Response.json({ error: "Recept nije pronađen" }, { status: 404 });
    }
    
    // if (existingRecipe.chefBeginnerId !== Number(chefBeginnerId)) {
    //   return Response.json({ 
    //     error: "Samo kreator recepta može da ga obriše" 
    //   }, { status: 403 });
    // }
    
    await recipeController.deleteRecipe(Number(recipeId));
    
    return Response.json({
      message: "Recept je uspešno obrisan"
    }, { status: 200 });
    
  } catch (err) {
    console.error("Greška pri brisanju recepta:", err);
    return Response.json({ error: "Greška pri brisanju recepta" }, { status: 500 });
  }
}