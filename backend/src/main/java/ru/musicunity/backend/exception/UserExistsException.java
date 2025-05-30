package ru.musicunity.backend.exception;

public class UserExistsException extends RuntimeException {
    public UserExistsException() {
        super("User not found");
    }
}
