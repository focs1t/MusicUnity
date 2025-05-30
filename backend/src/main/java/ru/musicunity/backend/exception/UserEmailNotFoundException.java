package ru.musicunity.backend.exception;

public class UserEmailNotFoundException extends RuntimeException {
    public UserEmailNotFoundException(String email) {
        super("Пользователем с email " + email + " не найден");
    }
}
