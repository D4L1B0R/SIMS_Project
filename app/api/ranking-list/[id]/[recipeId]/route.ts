import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { UserController } from "@/lib/controllers/UserController";
import { getServerSession } from "next-auth";

const userController = new UserController();

export async function DELETE(
  request: Request, 
  context: { params: Promise<{ id: string, recipeId: string }> }
) {
  try {
    const session: any = await getServerSession(authOptions);
    const isModerator = session?.user?.isModerator;
    
    if (!isModerator) {
      return Response.json({ message: "Unauthorized" }, { status: 409 });
    }
    
    const params = await context.params;
    const { id, recipeId } = params;

    const rankingList = await userController.getRankingListById(parseInt(id));

    if (rankingList?.moderatorId != session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 409 });
    }

    await userController.deleteRecipeFromRankingList(rankingList?.id as number, parseInt(recipeId));

    return Response.json({ message: 'success' }, { status: 200 });

  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}