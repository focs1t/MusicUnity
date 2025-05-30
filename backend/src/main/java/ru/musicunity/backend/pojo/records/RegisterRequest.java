package ru.musicunity.backend.pojo.records;

public record RegisterRequest(
    String username,
    String email,
    String password
) {} 