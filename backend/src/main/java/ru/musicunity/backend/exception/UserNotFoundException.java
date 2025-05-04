package ru.musicunity.backend.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super("Пользователь с email " + message + " не найден");
    }
}