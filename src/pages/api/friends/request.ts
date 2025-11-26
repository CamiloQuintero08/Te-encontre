import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { friendships } from "../../../db/schema";
import { and, eq, or } from "drizzle-orm";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const userId = cookies.get("user_id")?.number();

    if (!userId) {
        return new Response("No autorizado", { status: 401 });
    }

    const data = await request.formData();
    const friendId = parseInt(data.get("friendId")?.toString() || "0");

    if (!friendId) {
        return new Response("ID de usuario inválido", { status: 400 });
    }

    // Check if friendship already exists
    const existing = await db
        .select()
        .from(friendships)
        .where(
            or(
                and(eq(friendships.userId1, userId), eq(friendships.userId2, friendId)),
                and(eq(friendships.userId1, friendId), eq(friendships.userId2, userId))
            )
        );

    if (existing.length > 0) {
        return new Response("Ya existe una solicitud o amistad con este usuario", { status: 400 });
    }

    // Create friend request
    await db.insert(friendships).values({
        userId1: userId,
        userId2: friendId,
        status: "pending",
    });

    return redirect("/");
};
