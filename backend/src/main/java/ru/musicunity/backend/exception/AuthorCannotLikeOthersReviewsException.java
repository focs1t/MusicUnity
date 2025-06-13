package ru.musicunity.backend.exception;

public class AuthorCannotLikeOthersReviewsException extends RuntimeException {
    public AuthorCannotLikeOthersReviewsException() {
        super("Автор может лайкать только рецензии на свои релизы");
    }
} 