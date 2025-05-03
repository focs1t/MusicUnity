package ru.musicunity.backend.exception;

public class ReviewNotFoundException extends RuntimeException {
    public ReviewNotFoundException(Long reviewId) {
        super("Рецензия с ID " + reviewId + " не найдена");
    }
}