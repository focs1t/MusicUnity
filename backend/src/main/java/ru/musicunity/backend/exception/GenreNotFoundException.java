package ru.musicunity.backend.exception;

public class GenreNotFoundException extends RuntimeException {
    public GenreNotFoundException(Long genreId) {
        super("Жанр с ID " + genreId + " не найден");
    }
}