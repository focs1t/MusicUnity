package ru.musicunity.backend.exception;

public class UserIsNotAuthorException extends RuntimeException {
    public UserIsNotAuthorException() {
        super("Пользователь не является автором");
    }
}
