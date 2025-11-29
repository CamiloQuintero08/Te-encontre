import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { posts } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const postId = formData.get("postId");
    const content = formData.get("content");
    const currentUserId = cookies.get("user_id")?.number();

    if (!currentUserId || !postId || !content) {
        return new Response("Unauthorized or Missing Data", { status: 401 });
    }

    try {
        await db.update(posts)
            .set({ content: content.toString() })
            .where(and(eq(posts.id, Number(postId)), eq(posts.userId, currentUserId)));

        return redirect(request.headers.get("referer") || "/");
    } catch (error) {
        console.error("Error editing post:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};
