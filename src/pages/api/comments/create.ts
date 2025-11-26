import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { comments } from "../../../db/schema";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const userId = cookies.get("user_id")?.number();

    if (!userId) {
        return new Response("No autorizado", { status: 401 });
    }

    const data = await request.formData();
    const postId = parseInt(data.get("postId")?.toString() || "0");
    const content = data.get("content")?.toString();

    if (!postId || !content) {
        return new Response("Datos inválidos", { status: 400 });
    }

    await db.insert(comments).values({
        postId,
        userId,
        content,
    });

    return redirect("/");
};
