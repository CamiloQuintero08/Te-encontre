# Guía de Sustentación - Proyecto Te-Encontré

## 📋 Información General del Proyecto

**Nombre:** Te-Encontré  
**Tipo:** Red Social  
**Asignatura:** Bases de Datos 1  
**Base de Datos:** MySQL  

### Descripción del Proyecto
Te-Encontré es una red social completa que permite a los usuarios:
- Crear y gestionar perfiles personales
- Conectar con otros usuarios mediante solicitudes de amistad
- Publicar contenido (texto e imágenes)
- Interactuar con publicaciones (likes y comentarios)
- Enviar mensajes privados entre usuarios
- Buscar y filtrar usuarios por diferentes criterios
- Recibir notificaciones

---

## 🏗️ Arquitectura Tecnológica

### Stack Tecnológico

#### Frontend
- **Astro** - Framework web moderno para sitios estáticos y dinámicos
- **TailwindCSS** - Framework de CSS para diseño responsivo
- **TypeScript** - Superset de JavaScript con tipado estático

#### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Astro (SSR)** - Renderizado del lado del servidor

#### Base de Datos
- **MySQL** - Sistema de gestión de bases de datos relacional
- **Drizzle ORM** - ORM (Object-Relational Mapping) moderno para TypeScript
- **mysql2** - Driver de MySQL para Node.js

#### Seguridad
- **bcryptjs** - Librería para hashear contraseñas

---

## 🗄️ ARQUITECTURA DE BASE DE DATOS

### Modelo Entidad-Relación

El proyecto implementa **7 tablas principales** que representan las entidades del sistema:

#### 1. **Tabla: users** (Usuarios)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    photo TEXT,
    age INT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito:** Almacena la información de los usuarios registrados.

**Campos importantes:**
- `id`: Identificador único auto-incremental
- `email`: Único en el sistema (índice único)
- `password`: Almacenada con hash bcrypt
- `photo`: URL de la foto de perfil
- `age` y `location`: Para filtros de búsqueda

**Índices:**
- `email_idx` (UNIQUE) - Búsqueda rápida por email
- `name_idx` - Búsqueda por nombre
- `location_idx` - Filtrado por ubicación

---

#### 2. **Tabla: friendships** (Amistades)
```sql
CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    user_id_1 INT NOT NULL,
    user_id_2 INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito:** Gestiona las relaciones de amistad entre usuarios.

**Estados posibles:**
- `pending` - Solicitud enviada pero no aceptada
- `accepted` - Amistad confirmada
- `rejected` - Solicitud rechazada

**Relaciones:**
- `user_id_1` → `users.id` (Usuario que envía la solicitud)
- `user_id_2` → `users.id` (Usuario que recibe la solicitud)

**Índices:**
- `user_id_1_idx` - Búsqueda de amistades por usuario 1
- `user_id_2_idx` - Búsqueda de amistades por usuario 2

---

#### 3. **Tabla: posts** (Publicaciones)
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito:** Almacena las publicaciones creadas por los usuarios.

**Campos:**
- `user_id`: Referencia al autor de la publicación
- `content`: Texto de la publicación
- `image_url`: URL opcional de imagen adjunta

**Relaciones:**
- `user_id` → `users.id` (Relación N:1 - Un usuario puede tener muchas publicaciones)

**Índices:**
- `user_id_idx` - Búsqueda rápida de publicaciones por usuario

---

#### 4. **Tabla: likes** (Me Gusta)
```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito:** Registra los "me gusta" de usuarios en publicaciones.

**Relaciones:**
- `post_id` → `posts.id` (Publicación que recibe el like)
- `user_id` → `users.id` (Usuario que da el like)

**Restricción implícita:** Un usuario solo puede dar un like por publicación (manejado en la aplicación).

**Índices:**
- `post_id_idx` - Contar likes por publicación
- `user_id_idx` - Ver likes dados por un usuario

---

#### 5. **Tabla: comments** (Comentarios)
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito:** Almacena comentarios en las publicaciones.

**Relaciones:**
- `post_id` → `posts.id` (Publicación comentada)
- `user_id` → `users.id` (Autor del comentario)

**Índices:**
- `post_id_idx` - Obtener comentarios de una publicación
- `user_id_idx` - Ver comentarios de un usuario

---

#### 6. **Tabla: messages** (Mensajes)
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito:** Sistema de mensajería privada entre usuarios.

**Campos:**
- `sender_id`: Usuario que envía el mensaje
- `receiver_id`: Usuario que recibe el mensaje
- `is_read`: Estado de lectura (0 = no leído, 1 = leído)

**Relaciones:**
- `sender_id` → `users.id`
- `receiver_id` → `users.id`

**Índices:**
- `sender_id_idx` - Mensajes enviados por un usuario
- `receiver_id_idx` - Mensajes recibidos por un usuario

---

#### 7. **Tabla: notifications** (Notificaciones)
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_sent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Propósito:** Sistema de notificaciones para usuarios.

**Tipos de notificaciones:**
- `email` - Notificación por correo
- `push` - Notificación push (futura implementación)

**Campos:**
- `is_sent`: Indica si la notificación fue enviada (0 = pendiente, 1 = enviada)

**Relaciones:**
- `user_id` → `users.id`

---

## 🔍 VISTAS DE BASE DE DATOS

Las vistas son consultas SQL pre-definidas que simplifican el acceso a datos complejos.

### 1. **user_profile_summary**
```sql
CREATE OR REPLACE VIEW user_profile_summary AS
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.photo, 
    u.age,
    u.location,
    u.created_at,
    (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) as post_count,
    (SELECT COUNT(*) FROM friendships f 
     WHERE (f.user_id_1 = u.id OR f.user_id_2 = u.id) 
     AND f.status = 'accepted') as friend_count
FROM users u;
```

**Propósito:** Proporciona un resumen del perfil de cada usuario incluyendo:
- Información básica del usuario
- Número total de publicaciones
- Número total de amigos

**Uso:** Mostrar perfiles de usuario con estadísticas.

---

### 2. **user_news_feed**
```sql
CREATE OR REPLACE VIEW user_news_feed AS
SELECT 
    u.id AS viewer_id,
    p.id AS post_id,
    p.content,
    p.image_url,
    p.created_at,
    author.id AS author_id,
    author.name AS author_name,
    author.photo AS author_photo,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
FROM users u
JOIN friendships f ON (u.id = f.user_id_1 OR u.id = f.user_id_2) 
    AND f.status = 'accepted'
JOIN posts p ON p.user_id = CASE 
    WHEN u.id = f.user_id_1 THEN f.user_id_2 
    ELSE f.user_id_1 
END
JOIN users author ON p.user_id = author.id;
```

**Propósito:** Genera el feed de noticias personalizado para cada usuario.

**Funcionalidad:**
- Muestra solo publicaciones de amigos aceptados
- Incluye información del autor
- Cuenta likes y comentarios de cada publicación

**Uso:** `SELECT * FROM user_news_feed WHERE viewer_id = [ID_USUARIO]`

---

### 3. **network_stats**
```sql
CREATE OR REPLACE VIEW network_stats AS
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM posts) AS total_posts,
    (SELECT COUNT(*) FROM comments) AS total_comments,
    (SELECT COUNT(*) FROM likes) AS total_likes;
```

**Propósito:** Estadísticas globales de la red social.

**Uso:** Dashboard de administración o página de estadísticas.

---

### 4. **post_details_view**
```sql
CREATE OR REPLACE VIEW post_details_view AS
SELECT 
    p.id AS post_id,
    p.content,
    p.image_url,
    p.created_at,
    p.user_id AS author_id,
    u.name AS author_name,
    u.photo AS author_photo,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
FROM posts p
JOIN users u ON p.user_id = u.id;
```

**Propósito:** Vista completa de publicaciones con información del autor y estadísticas.

**Uso:** Mostrar publicaciones en el feed principal.

---

## ⚙️ PROCEDIMIENTOS ALMACENADOS

Los procedimientos almacenados son rutinas SQL que encapsulan lógica de negocio en la base de datos.

### 1. **sp_insert_user**
```sql
CREATE PROCEDURE sp_insert_user(
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_photo TEXT,
    IN p_age INT,
    IN p_location VARCHAR(255)
)
BEGIN
    INSERT INTO users (name, email, password, photo, age, location) 
    VALUES (p_name, p_email, p_password, p_photo, p_age, p_location);
END
```

**Propósito:** Insertar un nuevo usuario en el sistema.

**Parámetros:**
- `p_name`: Nombre del usuario
- `p_email`: Email único
- `p_password`: Contraseña hasheada
- `p_photo`: URL de foto de perfil
- `p_age`: Edad del usuario
- `p_location`: Ubicación

**Llamada:** `CALL sp_insert_user('Juan', 'juan@email.com', 'hash...', 'url', 25, 'Bogotá');`

---

### 2. **sp_delete_post**
```sql
CREATE PROCEDURE sp_delete_post(
    IN p_post_id INT
)
BEGIN
    DELETE FROM likes WHERE post_id = p_post_id;
    DELETE FROM comments WHERE post_id = p_post_id;
    DELETE FROM posts WHERE id = p_post_id;
END
```

**Propósito:** Eliminar una publicación y todas sus dependencias.

**Funcionalidad:**
1. Elimina todos los likes de la publicación
2. Elimina todos los comentarios de la publicación
3. Elimina la publicación

**Importancia:** Mantiene la integridad referencial al eliminar datos relacionados.

**Llamada:** `CALL sp_delete_post(123);`

---

### 3. **sp_notify_friends**
```sql
CREATE PROCEDURE sp_notify_friends(
    IN p_user_id INT,
    IN p_message TEXT
)
BEGIN
    INSERT INTO notifications (user_id, type, content)
    SELECT 
        CASE 
            WHEN user_id_1 = p_user_id THEN user_id_2 
            ELSE user_id_1 
        END as user_id,
        'email',
        p_message
    FROM friendships
    WHERE (user_id_1 = p_user_id OR user_id_2 = p_user_id) 
    AND status = 'accepted';
END
```

**Propósito:** Enviar notificaciones a todos los amigos de un usuario.

**Funcionalidad:**
- Identifica todos los amigos aceptados del usuario
- Crea una notificación para cada amigo
- Tipo de notificación: 'email'

**Uso:** Notificar cuando un usuario crea una nueva publicación.

**Llamada:** `CALL sp_notify_friends(5, 'Juan ha publicado algo nuevo');`

---

## 💻 IMPLEMENTACIÓN EN EL PROYECTO

### Configuración de Drizzle ORM

#### 1. **Archivo de Configuración** (`drizzle.config.ts`)
```typescript
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "mysql",
    dbCredentials: {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "te_encontre",
    },
});
```

**Explicación:**
- Define la ubicación del esquema de base de datos
- Configura el dialecto (MySQL)
- Lee credenciales desde variables de entorno (.env)

---

#### 2. **Cliente de Base de Datos** (`src/db/client.ts`)
```typescript
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "te_encontre",
});

export const db = drizzle(connection);
```

**Explicación:**
- Crea una conexión a MySQL usando mysql2
- Inicializa Drizzle ORM con la conexión
- Exporta `db` para usar en toda la aplicación

---

#### 3. **Definición del Esquema** (`src/db/schema.ts`)

El esquema define las tablas usando la sintaxis de Drizzle ORM:

```typescript
import { mysqlTable, serial, varchar, timestamp, int, text, 
         uniqueIndex, index } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    photo: text('photo'),
    age: int('age'),
    location: varchar('location', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
}, (users) => ({
    emailIndex: uniqueIndex('email_idx').on(users.email),
    nameIndex: index('name_idx').on(users.name),
    locationIndex: index('location_idx').on(users.location),
}));
```

**Ventajas de Drizzle ORM:**
- Type-safety: TypeScript infiere tipos automáticamente
- Sintaxis declarativa y legible
- Generación automática de migraciones
- Índices definidos junto con las tablas

---

### Consultas a la Base de Datos (`src/db/queries.ts`)

El archivo `queries.ts` contiene **11 funciones principales** para interactuar con la base de datos:

#### 1. **getUserInfo** - Obtener información de un usuario
```typescript
export const getUserInfo = async (userId: number) => {
    return await db.select().from(users).where(eq(users.id, userId));
};
```

**Uso:** Mostrar perfil de usuario.

---

#### 2. **getUserFriends** - Listar amigos de un usuario
```typescript
export const getUserFriends = async (userId: number) => {
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
```

**Explicación:**
- Busca amistades donde el usuario sea `userId1` o `userId2`
- Solo incluye amistades con status 'accepted'
- Combina ambos resultados

**Uso:** Página de amigos.

---

#### 3. **searchUsers** - Buscar usuarios por nombre
```typescript
export const searchUsers = async (query: string) => {
    return await db.select().from(users).where(like(users.name, `%${query}%`));
};
```

**Uso:** Barra de búsqueda de usuarios.

---

#### 4. **getRecentPosts** - Obtener publicaciones recientes
```typescript
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
```

**Características:**
- JOIN con tabla users para obtener información del autor
- Ordenado por fecha descendente (más recientes primero)
- Límite configurable

**Uso:** Feed principal de la red social.

---

#### 5. **getPostLikesCount** - Contar likes de una publicación
```typescript
export const getPostLikesCount = async (postId: number) => {
    const result = await db.select({ count: sql<number>`count(*)` })
        .from(likes)
        .where(eq(likes.postId, postId));
    return result[0].count;
};
```

**Uso:** Mostrar número de likes en cada publicación.

---

#### 6. **getPostComments** - Listar comentarios de una publicación
```typescript
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
```

**Uso:** Sección de comentarios de cada publicación.

---

#### 7. **filterUsers** - Filtrar usuarios por criterios
```typescript
export const filterUsers = async (criteria: { 
    minAge?: number, 
    maxAge?: number, 
    location?: string 
}) => {
    const conditions = [];
    if (criteria.minAge) conditions.push(gt(users.age, criteria.minAge));
    if (criteria.maxAge) conditions.push(lt(users.age, criteria.maxAge));
    if (criteria.location) conditions.push(like(users.location, `%${criteria.location}%`));

    if (conditions.length === 0) return await db.select().from(users);

    return await db.select().from(users).where(and(...conditions));
};
```

**Características:**
- Filtros opcionales y combinables
- Búsqueda por rango de edad
- Búsqueda por ubicación

**Uso:** Búsqueda avanzada de usuarios.

---

#### 8. **getUsageStats** - Estadísticas de uso
```typescript
export const getUsageStats = async () => {
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const postCount = await db.select({ count: sql<number>`count(*)` }).from(posts);
    const commentCount = await db.select({ count: sql<number>`count(*)` }).from(comments);

    const dailyPosts = await db.select({
        date: sql<string>`DATE(${posts.createdAt})`,
        count: sql<number>`count(*)`
    })
    .from(posts)
    .groupBy(sql`DATE(${posts.createdAt})`)
    .orderBy(desc(sql`DATE(${posts.createdAt})`))
    .limit(30);

    return {
        totalUsers: userCount[0].count,
        totalPosts: postCount[0].count,
        totalComments: commentCount[0].count,
        dailyPosts
    };
};
```

**Propósito:** Dashboard de estadísticas.

**Datos proporcionados:**
- Total de usuarios
- Total de publicaciones
- Total de comentarios
- Publicaciones por día (últimos 30 días)

---

#### 9. **getMostActiveUsers** - Usuarios más activos
```typescript
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
```

**Uso:** Ranking de usuarios más activos.

---

#### 10. **getTopLikedPosts** - Publicaciones más populares
```typescript
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
```

**Uso:** Sección de publicaciones trending.

---

#### 11. **getUnreadMessages** - Mensajes no leídos
```typescript
export const getUnreadMessages = async (userId: number) => {
    return await db.select()
        .from(messages)
        .where(and(eq(messages.receiverId, userId), eq(messages.isRead, 0)));
};
```

**Uso:** Notificación de mensajes pendientes.

---

## 🔐 SEGURIDAD

### Hashing de Contraseñas

El proyecto usa **bcryptjs** para hashear contraseñas:

```typescript
import bcrypt from 'bcryptjs';

// Al registrar un usuario
const hashedPassword = await bcrypt.hash(password, 10);

// Al hacer login
const isValid = await bcrypt.compare(inputPassword, storedHashedPassword);
```

**Ventajas:**
- Las contraseñas nunca se almacenan en texto plano
- Usa salt rounds (10) para mayor seguridad
- Resistente a ataques de fuerza bruta

---

## 📊 ÍNDICES Y OPTIMIZACIÓN

### Estrategia de Indexación

El proyecto implementa índices estratégicos para optimizar consultas:

1. **Índices Únicos:**
   - `users.email` - Garantiza emails únicos y búsqueda rápida

2. **Índices de Búsqueda:**
   - `users.name` - Búsqueda de usuarios por nombre
   - `users.location` - Filtrado por ubicación

3. **Índices de Relaciones:**
   - `friendships.user_id_1` y `user_id_2` - Consultas de amistades
   - `posts.user_id` - Publicaciones por usuario
   - `likes.post_id` y `user_id` - Conteo de likes
   - `comments.post_id` y `user_id` - Comentarios por publicación
   - `messages.sender_id` y `receiver_id` - Mensajes entre usuarios

**Impacto:**
- Consultas más rápidas
- Mejor rendimiento con grandes volúmenes de datos
- Escalabilidad mejorada

---

## 🌐 API ENDPOINTS

El proyecto implementa endpoints API en `src/pages/api/`:

### Autenticación
- **POST** `/api/auth/login` - Iniciar sesión
- **POST** `/api/auth/register` - Registrar usuario
- **POST** `/api/auth/logout` - Cerrar sesión

### Publicaciones
- **GET** `/api/posts/get` - Obtener publicaciones
- **POST** `/api/posts/create` - Crear publicación
- **DELETE** `/api/posts/delete` - Eliminar publicación
- **POST** `/api/posts/like` - Dar like a publicación

### Comentarios
- **GET** `/api/comments/get` - Obtener comentarios
- **POST** `/api/comments/create` - Crear comentario
- **DELETE** `/api/comments/delete` - Eliminar comentario

### Amistades
- **GET** `/api/friends/get` - Obtener amigos
- **POST** `/api/friends/request` - Enviar solicitud
- **POST** `/api/friends/accept` - Aceptar solicitud

### Mensajes
- **GET** `/api/messages/get` - Obtener mensajes
- **POST** `/api/messages/send` - Enviar mensaje
- **PUT** `/api/messages/read` - Marcar como leído

### Perfil
- **PUT** `/api/profile/update` - Actualizar perfil

---

## 🎯 FUNCIONALIDADES PRINCIPALES

### 1. Sistema de Autenticación
- Registro de usuarios con validación
- Login con email y contraseña
- Contraseñas hasheadas con bcrypt
- Sesiones de usuario

### 2. Gestión de Perfiles
- Creación y edición de perfil
- Foto de perfil
- Información personal (edad, ubicación)
- Estadísticas del usuario

### 3. Sistema de Amistades
- Envío de solicitudes de amistad
- Aceptación/rechazo de solicitudes
- Lista de amigos
- Estados: pending, accepted, rejected

### 4. Publicaciones
- Crear publicaciones con texto e imágenes
- Feed de publicaciones recientes
- Publicaciones de amigos
- Eliminar propias publicaciones

### 5. Interacciones Sociales
- Sistema de likes
- Comentarios en publicaciones
- Contador de likes y comentarios

### 6. Mensajería
- Chat privado entre usuarios
- Mensajes en tiempo real
- Estado de lectura (leído/no leído)
- Historial de conversaciones

### 7. Búsqueda y Filtros
- Búsqueda de usuarios por nombre
- Filtros por edad
- Filtros por ubicación
- Búsqueda avanzada

### 8. Estadísticas
- Usuarios más activos
- Publicaciones más populares
- Estadísticas globales de la red
- Publicaciones por día

---

## 📝 PUNTOS CLAVE PARA LA SUSTENTACIÓN

### Conceptos de Base de Datos Implementados

1. **Normalización:**
   - Todas las tablas están en 3FN (Tercera Forma Normal)
   - No hay redundancia de datos
   - Relaciones bien definidas

2. **Integridad Referencial:**
   - Claves foráneas implícitas en el diseño
   - Procedimiento `sp_delete_post` mantiene integridad

3. **Índices:**
   - Índices únicos para unicidad
   - Índices compuestos para consultas complejas
   - Optimización de búsquedas

4. **Vistas:**
   - Simplificación de consultas complejas
   - Reutilización de lógica
   - Abstracción de complejidad

5. **Procedimientos Almacenados:**
   - Encapsulación de lógica de negocio
   - Transacciones atómicas
   - Reutilización de código

6. **Tipos de Relaciones:**
   - **1:N** - Usuario → Publicaciones
   - **N:M** - Usuarios ↔ Usuarios (amistades)
   - **1:N** - Publicación → Comentarios
   - **1:N** - Publicación → Likes

---

## 🚀 FLUJO DE DATOS

### Ejemplo: Crear una Publicación

1. **Usuario crea publicación** (Frontend)
2. **Request a** `/api/posts/create` (API)
3. **Validación de datos** (Backend)
4. **INSERT en tabla posts** (Base de Datos)
5. **Llamada a** `sp_notify_friends` (Procedimiento Almacenado)
6. **INSERT en tabla notifications** (Base de Datos)
7. **Respuesta al cliente** (API)
8. **Actualización de UI** (Frontend)

---

## 💡 VENTAJAS DEL DISEÑO

1. **Escalabilidad:**
   - Índices optimizados
   - Consultas eficientes
   - Estructura modular

2. **Mantenibilidad:**
   - Código organizado
   - Separación de responsabilidades
   - ORM type-safe

3. **Seguridad:**
   - Contraseñas hasheadas
   - Validación de datos
   - Prevención de SQL injection (ORM)

4. **Rendimiento:**
   - Vistas pre-calculadas
   - Índices estratégicos
   - Consultas optimizadas

---

## 📚 TECNOLOGÍAS Y CONCEPTOS

### Drizzle ORM
- **Type-safe:** TypeScript infiere tipos automáticamente
- **SQL-like:** Sintaxis similar a SQL
- **Migraciones:** Generación automática
- **Performance:** Consultas optimizadas

### MySQL
- **ACID:** Transacciones confiables
- **Índices:** B-Tree para búsquedas rápidas
- **Vistas:** Consultas virtuales
- **Procedimientos:** Lógica en la BD

### Astro
- **SSR:** Server-Side Rendering
- **API Routes:** Endpoints backend
- **TypeScript:** Type safety

---

## 🎓 PREGUNTAS FRECUENTES EN SUSTENTACIONES

### ¿Por qué usar un ORM?
- **Respuesta:** Drizzle ORM proporciona type-safety, previene SQL injection, simplifica consultas complejas y facilita el mantenimiento del código.

### ¿Cómo se manejan las relaciones N:M?
- **Respuesta:** La tabla `friendships` actúa como tabla intermedia entre usuarios, almacenando `user_id_1` y `user_id_2` con un estado de la relación.

### ¿Por qué usar vistas?
- **Respuesta:** Las vistas simplifican consultas complejas, mejoran la legibilidad del código y permiten reutilizar lógica de consultas.

### ¿Cómo se garantiza la seguridad de las contraseñas?
- **Respuesta:** Usamos bcryptjs para hashear contraseñas con salt rounds, nunca almacenamos contraseñas en texto plano.

### ¿Qué ventajas tienen los procedimientos almacenados?
- **Respuesta:** Encapsulan lógica de negocio, garantizan transacciones atómicas, mejoran el rendimiento y facilitan el mantenimiento.

### ¿Cómo se optimizan las consultas?
- **Respuesta:** Mediante índices estratégicos en columnas frecuentemente consultadas, vistas pre-calculadas y consultas eficientes con JOINs apropiados.

---

## 📖 GLOSARIO

- **ORM:** Object-Relational Mapping - Mapeo de objetos a tablas
- **Hash:** Función criptográfica unidireccional
- **Salt:** Datos aleatorios añadidos al hash
- **JOIN:** Combinación de tablas relacionadas
- **Índice:** Estructura de datos para búsquedas rápidas
- **Vista:** Consulta SQL almacenada como tabla virtual
- **Procedimiento:** Rutina SQL almacenada
- **3FN:** Tercera Forma Normal de normalización
- **ACID:** Atomicidad, Consistencia, Aislamiento, Durabilidad
- **SSR:** Server-Side Rendering

---

## ✅ CHECKLIST DE SUSTENTACIÓN

- [ ] Explicar el propósito del proyecto
- [ ] Describir la arquitectura tecnológica
- [ ] Mostrar el diagrama de base de datos
- [ ] Explicar cada tabla y sus relaciones
- [ ] Demostrar las vistas creadas
- [ ] Explicar los procedimientos almacenados
- [ ] Mostrar el código de queries.ts
- [ ] Demostrar la aplicación funcionando
- [ ] Explicar la seguridad implementada
- [ ] Responder preguntas técnicas

---

**¡Buena suerte en tu sustentación! 🎉**
