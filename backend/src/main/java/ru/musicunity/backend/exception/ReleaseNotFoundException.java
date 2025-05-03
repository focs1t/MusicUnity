package ru.musicunity.backend.exception;

public class ReleaseNotFoundException extends RuntimeException {
    public ReleaseNotFoundException(Long releaseId) {
        super("Релиз с ID " + releaseId + " не найден");
    }
}