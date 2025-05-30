package ru.musicunity.backend.exception;

public class ReportNotFoundException extends RuntimeException {
    public ReportNotFoundException(Long reportId) {
        super("Жалоба с ID " + reportId + " не найдена");
    }
}