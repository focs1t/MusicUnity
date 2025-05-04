package ru.musicunity.backend.exception;

public class AuditNotFoundException extends RuntimeException {
    public AuditNotFoundException(Long auditId) {
        super("Аудит с ID " + auditId + " не найден");
    }
} 