import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { friendships } from "../../../db/schema";
import { and, eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const userId = cookies.get("user_id")?.number();

    if (!userId) {
        return new Response("No autorizado", { status: 401 });
    }

    const data = await request.formData();
    const friendshipId = parseInt(data.get("friendshipId")?.toString() || "0");

    if (!friendshipId) {
        return new Response("ID de solicitud inválido", { status: 400 });
    }

    // Delete the friendship request
    // Only the receiver (userId2) can reject
    await db
        .delete(friendships)
        .where(
            and(
                eq(friendships.id, friendshipId),
                eq(friendships.userId2, userId),
                eq(friendships.status, "pending")
            )
        );

    return redirect("/requests");
};
