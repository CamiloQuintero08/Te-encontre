import { db } from './client';
import { users, friendships, posts, likes, comments, messages } from './schema';
import { eq, like, desc, sql, and, or, gt, lt } from 'drizzle-orm';

// 1. Obtener información de un usuario específico
export const getUserInfo = async (userId: number) => {
    return await db.select().from(users).where(eq(users.id, userId));
};

// 2. Listar los amigos de un usuario
export const getUserFriends = async (userId: number) => {
    // Buscamos amistades aceptadas donde el usuario sea userId1 o userId2
    const friends1 = await db.select({
        friendId: friendships.userId2,
        friendName: users.name,
        friendEmail: users.email,
        friendPhoto: users.photo
    })
        .from(friendships)
        .innerJoin(users, eq(friendships.userId2, users.id))
        .where(and(eq(friendships.userId1, userId), eq(friendships.status, 'accepted')));

    const friends2 = await db.select({
        friendId: friendships.userId1,
        friendName: users.name,
        friendEmail: users.email,
        friendPhoto: users.photo
    })
        .from(friendships)
        .innerJoin(users, eq(friendships.userId1, users.id))
        .where(and(eq(friendships.userId2, userId), eq(friendships.status, 'accepted')));

    return [...friends1, ...friends2];
};

// 3. Buscar usuarios por nombre o apellido
export const searchUsers = async (query: string) => {
    return await db.select().from(users).where(like(users.name, `%${query}%`));
};

// 4. Obtener las publicaciones más recientes
export const getRecentPosts = async (limit: number = 10) => {
    return await db.select({
        id: posts.id,
        content: posts.content,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        authorName: users.name,
        authorPhoto: users.photo
    })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .orderBy(desc(posts.createdAt))
        .limit(limit);
};

// 5. Contar el número de "me gusta" de una publicación
export const getPostLikesCount = async (postId: number) => {
    const result = await db.select({ count: sql<number>`count(*)` })
        .from(likes)
        .where(eq(likes.postId, postId));
    return result[0].count;
};

// 6. Listar los comentarios de una publicación
export const getPostComments = async (postId: number) => {
    return await db.select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        authorName: users.name,
        authorPhoto: users.photo
    })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.postId, postId))
        .orderBy(desc(comments.createdAt));
};

// 7. Obtener usuarios que cumplen con ciertos criterios (por ejemplo, edad, ubicación)
export const filterUsers = async (criteria: { minAge?: number, maxAge?: number, location?: string }) => {
    const conditions = [];
    if (criteria.minAge) conditions.push(gt(users.age, criteria.minAge));
    if (criteria.maxAge) conditions.push(lt(users.age, criteria.maxAge));
    if (criteria.location) conditions.push(like(users.location, `%${criteria.location}%`));

    if (conditions.length === 0) return await db.select().from(users);

    return await db.select().from(users).where(and(...conditions));
};

// 8. Calcular estadísticas de uso (usuarios activos, publicaciones diarias)
export const getUsageStats = async () => {
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const postCount = await db.select({ count: sql<number>`count(*)` }).from(posts);
    const commentCount = await db.select({ count: sql<number>`count(*)` }).from(comments);

    // Publicaciones diarias (agrupadas por fecha)
    const dailyPosts = await db.select({
        date: sql<string>`DATE(${posts.createdAt})`,
        count: sql<number>`count(*)`
    })
        .from(posts)
        .groupBy(sql`DATE(${posts.createdAt})`)
        .orderBy(desc(sql`DATE(${posts.createdAt})`))
        .limit(30); // Últimos 30 días

    return {
        totalUsers: userCount[0].count,
        totalPosts: postCount[0].count,
        totalComments: commentCount[0].count,
        dailyPosts
    };
};

// 9. Obtener usuarios más activos (con más publicaciones)
export const getMostActiveUsers = async (limit: number = 5) => {
    return await db.select({
        userId: users.id,
        userName: users.name,
        postCount: sql<number>`count(${posts.id})`
    })
        .from(users)
        .leftJoin(posts, eq(users.id, posts.userId))
        .groupBy(users.id)
        .orderBy(desc(sql`count(${posts.id})`))
        .limit(limit);
};

// 10. Obtener publicaciones con más "me gusta"
export const getTopLikedPosts = async (limit: number = 5) => {
    return await db.select({
        postId: posts.id,
        content: posts.content,
        likeCount: sql<number>`count(${likes.id})`
    })
        .from(posts)
        .leftJoin(likes, eq(posts.id, likes.postId))
        .groupBy(posts.id)
        .orderBy(desc(sql`count(${likes.id})`))
        .limit(limit);
};

// 11. Mensajes no leídos de un usuario
export const getUnreadMessages = async (userId: number) => {
    return await db.select()
        .from(messages)
        .where(and(eq(messages.receiverId, userId), eq(messages.isRead, 0)));
};
