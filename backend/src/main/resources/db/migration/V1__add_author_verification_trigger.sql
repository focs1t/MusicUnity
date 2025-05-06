CREATE OR REPLACE FUNCTION update_author_verification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        NEW.is_verified := EXISTS (
            SELECT 1 FROM users u 
            WHERE u.user_id = NEW.user_id 
            AND u.role = 1  -- код для UserRole.AUTHOR
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER author_verification_trigger
    BEFORE INSERT OR UPDATE OF user_id
    ON authors
    FOR EACH ROW
    EXECUTE FUNCTION update_author_verification(); 