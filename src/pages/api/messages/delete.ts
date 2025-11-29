import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { messages } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const formData = await request.formData();
    const messageId = formData.get("messageId");
    const currentUserId = cookies.get("user_id")?.number();

    if (!currentUserId || !messageId) {
        return new Response("Unauthorized or Missing Data", { status: 401 });
    }

    try {
        // Allow deletion if user is sender OR receiver (though typically sender deletes for everyone or just themselves, here we'll assume hard delete for simplicity as requested)
        await db.delete(messages)
            .where(and(eq(messages.id, Number(messageId)), eq(messages.senderId, currentUserId)));

        return redirect(request.headers.get("referer") || "/");
    } catch (error) {
        console.error("Error deleting message:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};
