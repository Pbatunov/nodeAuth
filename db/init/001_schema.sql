-- Схема выведена из SQL-запросов в backend/Controllers. Это НЕ выгрузка боевой БД.
-- Перед использованием сверить типы и индексы с боевой базой:
--   mysqldump --no-data -h HOST -u USER -p DB > schema.sql
-- Скрипт выполняется docker-entrypoint только при пустом volume (первый запуск).

CREATE TABLE IF NOT EXISTS test_users (
    id         VARCHAR(32)  NOT NULL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    login      VARCHAR(255) NOT NULL,
    password   VARCHAR(64)  NOT NULL,   -- MD5 без соли, см. README
    createDate VARCHAR(64)  NOT NULL,
    avatar     VARCHAR(255) NULL DEFAULT NULL,  -- migrations/001_add_avatar.sql уже учтён
    UNIQUE KEY uq_test_users_login (login)
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chats (
    id         VARCHAR(32) NOT NULL PRIMARY KEY,
    firstId    VARCHAR(32) NOT NULL,
    secondId   VARCHAR(32) NOT NULL,
    createDate VARCHAR(64) NOT NULL,
    KEY idx_chats_firstId (firstId),
    KEY idx_chats_secondId (secondId)
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
    id         VARCHAR(32)  NOT NULL PRIMARY KEY,
    chatId     VARCHAR(32)  NOT NULL,
    senderId   VARCHAR(32)  NOT NULL,
    message    TEXT         NOT NULL,
    createDate VARCHAR(64)  NOT NULL,  -- формат 'YYYY-MM-DD HH:MM:SS', сортировка по строке корректна
    KEY idx_chat_messages_chatId (chatId, createDate)
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
