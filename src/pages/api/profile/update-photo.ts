import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const userId = cookies.get("user_id")?.number();

    if (!userId) {
        return new Response("No autorizado", { status: 401 });
    }

    const data = await request.formData();
    const photoFile = data.get("photo") as File | null;

    if (!photoFile || photoFile.size === 0) {
        return new Response("Debes seleccionar una foto", { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (photoFile.size > maxSize) {
        return new Response("La imagen es demasiado grande. Máximo 5MB.", { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(photoFile.type)) {
        return new Response("Tipo de archivo no permitido. Use JPG, PNG, GIF o WEBP.", { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = photoFile.name.split('.').pop();
    const filename = `profile-${userId}-${timestamp}-${randomString}.${extension}`;

    // Save file to public/uploads/profiles
    const uploadsDir = join(process.cwd(), "public", "uploads", "profiles");
    const filepath = join(uploadsDir, filename);

    const arrayBuffer = await photoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);

    const photoUrl = `/uploads/profiles/${filename}`;

    // Update user photo in database
    await db
        .update(users)
        .set({ photo: photoUrl })
        .where(eq(users.id, userId));

    return redirect("/profile");
};
