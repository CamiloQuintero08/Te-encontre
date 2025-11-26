import { mysqlTable, serial, varchar, timestamp, int, text, uniqueIndex } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(), // En un caso real, esto debería ser hasheado
    photo: text('photo'), // URL de la foto
    createdAt: timestamp('created_at').defaultNow(),
}, (users) => ({
    emailIndex: uniqueIndex('email_idx').on(users.email),
}));

export const friendships = mysqlTable('friendships', {
    id: serial('id').primaryKey(),
    userId1: int('user_id_1').notNull(),
    userId2: int('user_id_2').notNull(),
    status: varchar('status', { length: 50 }).default('pending'), // pending, accepted, rejected
    createdAt: timestamp('created_at').defaultNow(),
});

export const posts = mysqlTable('posts', {
    id: serial('id').primaryKey(),
    userId: int('user_id').notNull(),
    content: text('content').notNull(),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const likes = mysqlTable('likes', {
    id: serial('id').primaryKey(),
    postId: int('post_id').notNull(),
    userId: int('user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const messages = mysqlTable('messages', {
    id: serial('id').primaryKey(),
    senderId: int('sender_id').notNull(),
    receiverId: int('receiver_id').notNull(),
    content: text('content').notNull(),
    isRead: int('is_read').default(0), // 0 = no leído, 1 = leído
    createdAt: timestamp('created_at').defaultNow(),
});

export const comments = mysqlTable('comments', {
    id: serial('id').primaryKey(),
    postId: int('post_id').notNull(),
    userId: int('user_id').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
