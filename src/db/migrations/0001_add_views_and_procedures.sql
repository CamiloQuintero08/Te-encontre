-- Vistas

-- 1. Vista de perfil de usuario resumido
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
    (SELECT COUNT(*) FROM friendships f WHERE (f.user_id_1 = u.id OR f.user_id_2 = u.id) AND f.status = 'accepted') as friend_count
FROM users u;

-- 2. Vista de muro de noticias de un usuario (Simulada: Muestra posts de amigos para cada usuario)
-- Para usarla: SELECT * FROM user_news_feed WHERE viewer_id = [ID_DEL_USUARIO]
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
JOIN friendships f ON (u.id = f.user_id_1 OR u.id = f.user_id_2) AND f.status = 'accepted'
JOIN posts p ON p.user_id = CASE WHEN u.id = f.user_id_1 THEN f.user_id_2 ELSE f.user_id_1 END
JOIN users author ON p.user_id = author.id;

-- 3. Vista de estadísticas de la red social
CREATE OR REPLACE VIEW network_stats AS
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM posts) AS total_posts,
    (SELECT COUNT(*) FROM comments) AS total_comments,
    (SELECT COUNT(*) FROM likes) AS total_likes;

-- Procedimientos Almacenados

-- 1. Insertar un nuevo usuario
DROP PROCEDURE IF EXISTS sp_insert_user;
DELIMITER //
CREATE PROCEDURE sp_insert_user(
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_photo TEXT,
    IN p_age INT,
    IN p_location VARCHAR(255)
)
BEGIN
    INSERT INTO users (name, email, password, photo, age, location) VALUES (p_name, p_email, p_password, p_photo, p_age, p_location);
END //
DELIMITER ;

-- 2. Eliminar una publicación (y sus dependencias)
DROP PROCEDURE IF EXISTS sp_delete_post;
DELIMITER //
CREATE PROCEDURE sp_delete_post(
    IN p_post_id INT
)
BEGIN
    DELETE FROM likes WHERE post_id = p_post_id;
    DELETE FROM comments WHERE post_id = p_post_id;
    DELETE FROM posts WHERE id = p_post_id;
END //
DELIMITER ;

-- 3. Enviar notificación a los amigos de un usuario (correo)
-- Inserta en la tabla notifications simulando una cola de correos
DROP PROCEDURE IF EXISTS sp_notify_friends;
DELIMITER //
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
    WHERE (user_id_1 = p_user_id OR user_id_2 = p_user_id) AND status = 'accepted';
END //
DELIMITER ;

-- View: post_details_view (for displaying posts with author info and counts)
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
