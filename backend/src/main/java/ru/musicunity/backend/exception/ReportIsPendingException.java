package ru.musicunity.backend.exception;

public class ReportIsPendingException extends RuntimeException {
    public ReportIsPendingException() {
        super("Заявка не в статусе ожидания");
    }
}
