import type { APIRoute } from "astro";
import { db } from "../../../db/client";
import { posts } from "../../../db/schema";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const userId = cookies.get("user_id")?.number();

    if (!userId) {
        return new Response("No autorizado", { status: 401 });
    }

    const data = await request.formData();
    const content = data.get("content")?.toString();
    const imageFile = data.get("image") as File | null;

    if (!content) {
        return new Response("El contenido es obligatorio", { status: 400 });
    }

    let imageUrl: string | null = null;

    // Process image upload if provided
    if (imageFile && imageFile.size > 0) {
        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (imageFile.size > maxSize) {
            return new Response("La imagen es demasiado grande. Máximo 5MB.", { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(imageFile.type)) {
            return new Response("Tipo de archivo no permitido. Use JPG, PNG, GIF o WEBP.", { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = imageFile.name.split('.').pop();
        const filename = `${timestamp}-${randomString}.${extension}`;

        // Save file to public/uploads
        const uploadsDir = join(process.cwd(), "public", "uploads");
        const filepath = join(uploadsDir, filename);

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(filepath, buffer);

        imageUrl = `/uploads/${filename}`;
    }

    await db.insert(posts).values({
        userId,
        content,
        imageUrl,
    });

    return redirect("/");
};
