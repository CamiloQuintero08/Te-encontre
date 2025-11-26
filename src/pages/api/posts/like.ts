import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { likes } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const userId = cookies.get("user_id")?.number();

    if (!userId) {
        return new Response("No autorizado", { status: 401 });
    }

    const data = await request.formData();
    const postId = parseInt(data.get("postId")?.toString() || "0");

    if (!postId) {
        return new Response("Post ID inválido", { status: 400 });
    }

    // Check if user already liked this post
    const existingLike = await db
        .select()
        .from(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));

    if (existingLike.length > 0) {
        // Unlike: remove the like
        await db
            .delete(likes)
            .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
    } else {
        // Like: add the like
        await db.insert(likes).values({
            postId,
            userId,
        });
    }

    return redirect("/");
};
