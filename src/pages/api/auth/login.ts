import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
    const data = await request.formData();
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    if (!email || !password) {
        return new Response("Faltan campos obligatorios", { status: 400 });
    }

    // Buscar usuario
    const user = await db.select().from(users).where(eq(users.email, email));

    if (user.length === 0 || user[0].password !== password) {
        return new Response("Credenciales inválidas", { status: 401 });
    }

    // Iniciar sesión (simulado con cookie simple por ahora)
    cookies.set("user_id", user[0].id.toString(), { path: "/" });

    return redirect("/");
};
