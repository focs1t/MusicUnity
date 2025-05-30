package ru.musicunity.backend.exception;

public class AuditNotFoundException extends RuntimeException {
    public AuditNotFoundException(Long AuditId) {
      super("Аудит с ID " + AuditId + " не найден");
    }
}
