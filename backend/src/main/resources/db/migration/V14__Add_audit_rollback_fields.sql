-- Добавляем поля для отслеживания откатов в таблицу audit
ALTER TABLE audit ADD COLUMN is_rolled_back BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE audit ADD COLUMN rollback_at TIMESTAMP NULL; 