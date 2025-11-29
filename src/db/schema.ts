import { mysqlTable, serial, varchar, timestamp, int, text, uniqueIndex, index } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(), // En un caso real, esto debería ser hasheado
    photo: text('photo'), // URL de la foto
    age: int('age'),
    location: varchar('location', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
}, (users) => ({
    emailIndex: uniqueIndex('email_idx').on(users.email),
    nameIndex: index('name_idx').on(users.name),
    locationIndex: index('location_idx').on(users.location),
}));

export const friendships = mysqlTable('friendships', {
    id: serial('id').primaryKey(),
    userId1: int('user_id_1').notNull(),
    userId2: int('user_id_2').notNull(),
    status: varchar('status', { length: 50 }).default('pending'), // pending, accepted, rejected
    createdAt: timestamp('created_at').defaultNow(),
}, (friendships) => ({
    userId1Index: index('user_id_1_idx').on(friendships.userId1),
    userId2Index: index('user_id_2_idx').on(friendships.userId2),
}));

export const posts = mysqlTable('posts', {
    id: serial('id').primaryKey(),
    userId: int('user_id').notNull(),
    content: text('content').notNull(),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow(),
}, (posts) => ({
    userIdIndex: index('user_id_idx').on(posts.userId),
}));

export const likes = mysqlTable('likes', {
    id: serial('id').primaryKey(),
    postId: int('post_id').notNull(),
    userId: int('user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (likes) => ({
    postIdIndex: index('post_id_idx').on(likes.postId),
    userIdIndex: index('user_id_idx').on(likes.userId),
}));

export const messages = mysqlTable('messages', {
    id: serial('id').primaryKey(),
    senderId: int('sender_id').notNull(),
    receiverId: int('receiver_id').notNull(),
    content: text('content').notNull(),
    isRead: int('is_read').default(0), // 0 = no leído, 1 = leído
    createdAt: timestamp('created_at').defaultNow(),
}, (messages) => ({
    senderIdIndex: index('sender_id_idx').on(messages.senderId),
    receiverIdIndex: index('receiver_id_idx').on(messages.receiverId),
}));

export const comments = mysqlTable('comments', {
    id: serial('id').primaryKey(),
    postId: int('post_id').notNull(),
    userId: int('user_id').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (comments) => ({
    postIdIndex: index('post_id_idx').on(comments.postId),
    userIdIndex: index('user_id_idx').on(comments.userId),
}));

export const notifications = mysqlTable('notifications', {
    id: serial('id').primaryKey(),
    userId: int('user_id').notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'email', 'push', etc.
    content: text('content').notNull(),
    isSent: int('is_sent').default(0),
    createdAt: timestamp('created_at').defaultNow(),
}, (notifications) => ({
    userIdIndex: index('user_id_idx').on(notifications.userId),
}));
