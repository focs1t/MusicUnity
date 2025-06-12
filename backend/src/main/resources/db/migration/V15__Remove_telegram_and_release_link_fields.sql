-- Удаление поля telegram_chat_id из таблицы users
ALTER TABLE users DROP COLUMN IF EXISTS telegram_chat_id;

-- Удаление поля release_link из таблицы releases  
ALTER TABLE releases DROP COLUMN IF EXISTS release_link; 