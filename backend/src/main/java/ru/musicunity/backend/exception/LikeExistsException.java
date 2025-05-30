package ru.musicunity.backend.exception;

public class LikeExistsException extends RuntimeException {
    public LikeExistsException() {
        super("Нельзя поставить больше 1 лайка на рецензию");
    }
}
