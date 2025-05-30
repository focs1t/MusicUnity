package ru.musicunity.backend.exception;

public class UserNotInAuthorsException extends RuntimeException {
    public UserNotInAuthorsException() {
        super("Текущий пользователь должен быть указан в списке авторов релиза");
    }
} 