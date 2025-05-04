package ru.musicunity.backend.exception;

public class ReportNotFoundException extends RuntimeException {
    public ReportNotFoundException(Long reportId) {
        super("Report not found with ID: " + reportId);
    }
}