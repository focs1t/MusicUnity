package ru.musicunity.backend.exception;

public class UserBlockedException extends RuntimeException {
    public UserBlockedException() {
        super("Заблокированный пользователь не имеет прав");
    }
}
