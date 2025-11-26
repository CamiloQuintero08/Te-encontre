import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { messages } from "../../../db/schema";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const userId = cookies.get("user_id")?.number();

    if (!userId) {
        return new Response("No autorizado", { status: 401 });
    }

    const data = await request.formData();
    const receiverId = parseInt(data.get("receiverId")?.toString() || "0");
    const content = data.get("content")?.toString();

    if (!receiverId || !content) {
        return new Response("Datos inválidos", { status: 400 });
    }

    await db.insert(messages).values({
        senderId: userId,
        receiverId,
        content,
    });

    return redirect(`/chat/${receiverId}`);
};
