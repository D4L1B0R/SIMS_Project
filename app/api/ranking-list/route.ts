import { UserController } from "@/lib/controllers/UserController";
import { RankingListDTO, SessionUser } from "@/lib/dtos";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

const userController = new UserController();

export async function POST(request: Request) {
    try {
        const session: any = await getServerSession(authOptions);

        const isModerator = (session?.user as SessionUser)?.isModerator
        
        if(!isModerator)
            return Response.json({ message: "Unauthorized" }, { status: 409 });

        const data = {
            ...await request.json(), 
            moderatorId: parseInt(session?.user?.id), 
            moderator: { userId: parseInt(session?.user?.id) },
            created_at: new Date(),
            updated_at: new Date()
        } as RankingListDTO;

        console.log(data);
        await userController.addRankingList(data);

        return Response.json({ message: 'success' }, { status: 201 });
    } catch (error) {
        console.log(error);
        return Response.json({ error }, { status: 500 });
    }
}export async function GET(request: Request) {
  try {
    console.log("🔹 Headers:", Object.fromEntries(request.headers));

    const session: any = await getServerSession(authOptions);
    console.log("🔹 Session object:", session);

    const isModerator = (session?.user as SessionUser)?.isModerator;
    console.log("🔹 IsModerator:", isModerator);

    let data;

    if (isModerator) {
      const userId = parseInt((session?.user as SessionUser)?.id);
      data = await userController.getAllRankingLists(userId);
    } else {
      data = await userController.getAllRankingLists();
    }

    return Response.json({ data });
  } catch (error: any) {
    console.error("🔥 Error in GET:", error);
    return Response.json({ message: error?.message ?? "Unknown error" }, { status: 500 });
  }
}