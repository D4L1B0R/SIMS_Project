import { UserController } from "@/lib/controllers/UserController";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

const userController = new UserController();

export async function GET(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
    try {
        const session: any = await getServerSession(authOptions);
    
        const isModerator = session?.user?.isModerator;
            
        if(!isModerator)
            return Response.json({ message: "Unauthorized" }, { status: 409 });
        
        const params = await context.params;
        const { id } = params;

        const data = await userController.getRankingListById(parseInt(id));

        if(data?.moderatorId != session?.user?.id)
            return Response.json({ message: "Unauthorized" }, { status: 409 });

        return Response.json({ data }, { status: 200})
    } catch (error) {
        console.log(error);
        return Response.json({ error }, { status: 500 });
    }
}

export async function POST(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
    try {
        const session: any = await getServerSession(authOptions);
    
        const isModerator = session?.user?.isModerator;
            
        if(!isModerator)
            return Response.json({ message: "Unauthorized" }, { status: 409 });
        
        const params = await context.params;
        const { id } = params;

        const { recipeIds } = await request.json();

        const rankingList = await userController.getRankingListById(parseInt(id));

        if(rankingList?.moderatorId != session?.user?.id)
            return Response.json({ message: "Unauthorized" }, { status: 409 });

        await userController.addRecipeToRankinList(rankingList?.id as number, recipeIds)

        return Response.json({ message: 'success' }, { status: 200 });
    } catch (error) {
        console.log(error);
        return Response.json({ error }, { status: 500 });
    }
}

export async function PUT(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
    try {
        const session: any = await getServerSession(authOptions);
    
        const isModerator = session?.user?.isModerator;
            
        if(!isModerator)
            return Response.json({ message: "Unauthorized" }, { status: 409 });
        
        const params = await context.params;
        const { id } = params;

        const rankingList = await userController.getRankingListById(parseInt(id));

        if(rankingList?.moderatorId != session?.user?.id)
            return Response.json({ message: "Unauthorized" }, { status: 409 });

        const { description } = await request.json();

        await userController.updateRankingList(rankingList?.id as number, { description });

        return Response.json({ message: 'success' }, { status: 201 });
    } catch (error) {
        console.log(error);
        return Response.json({ error }, { status: 500 })
    }
}

export async function DELETE(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
    try {
        const session: any = await getServerSession(authOptions);
    
        const isModerator = session?.user?.isModerator;
            
        if(!isModerator)
            return Response.json({ message: "Unauthorized" }, { status: 409 });
        
        const params = await context.params;
        const { id } = params;

        const rankingList = await userController.getRankingListById(parseInt(id));

        if(rankingList?.moderatorId != session?.user?.id)
            return Response.json({ message: "Unauthorized" }, { status: 409 });
        
        await userController.deleteRankingList(rankingList?.id as number);

        return Response.json({ message: 'success'}, { status: 200 });
        
    } catch (error) {
        console.log(error);
        return Response.json({ error }, { status: 500 });
    }
}