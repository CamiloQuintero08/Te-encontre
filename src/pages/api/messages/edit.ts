import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { messages } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const messageId = formData.get("messageId");
    const content = formData.get("content");
    const currentUserId = cookies.get("user_id")?.number();

    if (!currentUserId || !messageId || !content) {
        return new Response("Unauthorized or Missing Data", { status: 401 });
    }

    try {
        await db.update(messages)
            .set({ content: content.toString() })
            .where(and(eq(messages.id, Number(messageId)), eq(messages.senderId, currentUserId)));

        return redirect(request.headers.get("referer") || "/");
    } catch (error) {
        console.error("Error editing message:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};
