import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { comments } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const commentId = formData.get("commentId");
    const currentUserId = cookies.get("user_id")?.number();

    if (!currentUserId || !commentId) {
        return new Response("Unauthorized or Missing Data", { status: 401 });
    }

    try {
        await db.delete(comments)
            .where(and(eq(comments.id, Number(commentId)), eq(comments.userId, currentUserId)));

        return redirect(request.headers.get("referer") || "/");
    } catch (error) {
        console.error("Error deleting comment:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};
