package ru.musicunity.backend.exception;

public class AuthorNotFoundException extends RuntimeException {
    public AuthorNotFoundException(Long authorId) {
        super("Author not found with ID: " + authorId);
    }
}