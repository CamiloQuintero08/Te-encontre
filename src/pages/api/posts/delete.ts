import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { posts, likes, comments } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const postId = formData.get("postId");
    const currentUserId = cookies.get("user_id")?.number();

    if (!currentUserId || !postId) {
        return new Response("Unauthorized or Missing Data", { status: 401 });
    }

    try {
        const postIdNum = Number(postId);

        // Verify ownership
        const post = await db.select().from(posts).where(eq(posts.id, postIdNum));

        if (post.length === 0 || post[0].userId !== currentUserId) {
            return new Response("Unauthorized", { status: 403 });
        }

        // Delete in order: likes, comments, then post
        await db.delete(likes).where(eq(likes.postId, postIdNum));
        await db.delete(comments).where(eq(comments.postId, postIdNum));
        await db.delete(posts).where(eq(posts.id, postIdNum));

        return redirect(request.headers.get("referer") || "/");
    } catch (error) {
        console.error("Error deleting post:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};
