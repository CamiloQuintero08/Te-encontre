import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, redirect }) => {
    const data = await request.formData();
    const name = data.get("name")?.toString();
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    if (!name || !email || !password) {
        return new Response("Faltan campos obligatorios", { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
        return new Response("El usuario ya existe", { status: 400 });
    }

    // Crear usuario
    await db.insert(users).values({
        name,
        email,
        password, // TODO: Hashear contraseña en producción
        photo: "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=random",
    });

    return redirect("/");
};
