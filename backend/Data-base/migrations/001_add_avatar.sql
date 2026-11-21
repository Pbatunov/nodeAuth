-- Колонка для аватара: в ней хранится путь к файлу вида /api/uploads/avatars/<file>.
-- Выполнить один раз до запуска новой версии бэкенда (иначе запрос списка чатов упадёт).
ALTER TABLE test_users ADD COLUMN avatar VARCHAR(255) NULL DEFAULT NULL;
