package ru.musicunity.backend.exception;

public class NoRoleSelectedException extends RuntimeException {
    public NoRoleSelectedException() {
        super("Необходимо выбрать хотя бы одну роль (исполнитель или продюсер) для текущего пользователя");
    }
} 