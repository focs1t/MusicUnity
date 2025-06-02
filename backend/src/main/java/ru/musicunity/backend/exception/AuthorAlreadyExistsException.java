package ru.musicunity.backend.exception;

public class AuthorAlreadyExistsException extends RuntimeException {
    public AuthorAlreadyExistsException(String authorName) {
        super("Автор с именем '" + authorName + "' уже существует");
    }
} 