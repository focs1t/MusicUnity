-- Триггер для обновления favoritesCount в таблице releases
CREATE OR REPLACE FUNCTION update_release_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE releases SET favorites_count = favorites_count + 1 WHERE release_id = NEW.release_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE releases SET favorites_count = favorites_count - 1 WHERE release_id = OLD.release_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_release_favorites_count_trigger
AFTER INSERT OR DELETE ON favorites
FOR EACH ROW
EXECUTE FUNCTION update_release_favorites_count();

-- Триггер для обновления followingCount в таблице authors
CREATE OR REPLACE FUNCTION update_author_following_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE authors SET following_count = following_count + 1 WHERE author_id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE authors SET following_count = following_count - 1 WHERE author_id = OLD.author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_author_following_count_trigger
AFTER INSERT OR DELETE ON user_followings
FOR EACH ROW
EXECUTE FUNCTION update_author_following_count(); 