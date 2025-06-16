package ru.musicunity.backend.exception;

/**
 * Исключение, которое выбрасывается, когда сущность не найдена в базе данных
 */
public class EntityNotFoundException extends RuntimeException {

    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(String entityName, Long id) {
        super(String.format("%s с id=%d не найден", entityName, id));
    }

    public EntityNotFoundException(String entityName, String identifier) {
        super(String.format("%s с идентификатором '%s' не найден", entityName, identifier));
    }
} 