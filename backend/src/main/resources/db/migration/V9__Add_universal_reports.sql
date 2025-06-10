-- Добавляем новые поля для универсальной системы репортов
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS type INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_id BIGINT NOT NULL DEFAULT 0;

-- Заполняем новые поля для существующих записей
-- Тип 0 = REVIEW (по умолчанию)
UPDATE reports SET type = 0, target_id = review_id WHERE review_id IS NOT NULL;

-- Делаем review_id nullable для новых типов репортов
ALTER TABLE reports ALTER COLUMN review_id DROP NOT NULL;

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_target_id ON reports(target_id);
CREATE INDEX IF NOT EXISTS idx_reports_type_target ON reports(type, target_id); 