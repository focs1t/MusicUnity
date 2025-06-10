-- Удаляем поле review_id из таблицы reports
ALTER TABLE reports DROP COLUMN IF EXISTS review_id; 