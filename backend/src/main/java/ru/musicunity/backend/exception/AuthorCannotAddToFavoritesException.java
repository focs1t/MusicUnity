package ru.musicunity.backend.exception;

public class AuthorCannotAddToFavoritesException extends RuntimeException {
    public AuthorCannotAddToFavoritesException() {
        super("Автор не может добавлять релизы в предпочтения");
    }
} 