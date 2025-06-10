-- Убираем ограничение NOT NULL с review_id (если оно есть)
ALTER TABLE reports ALTER COLUMN review_id DROP NOT NULL;

-- Добавляем поля если их нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='type') THEN
        ALTER TABLE reports ADD COLUMN type INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='target_id') THEN
        ALTER TABLE reports ADD COLUMN target_id BIGINT NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Заполняем данные для существующих записей
UPDATE reports SET type = 0, target_id = COALESCE(review_id, 0) WHERE type IS NULL OR target_id IS NULL;

-- Удаляем поле review_id полностью
ALTER TABLE reports DROP COLUMN IF EXISTS review_id; 