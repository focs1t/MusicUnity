package ru.musicunity.backend.dto;

import lombok.Data;

/**
 * DTO для обновления данных пользователя
 */
@Data
public class UserUpdateDTO {
    private String bio;
    private String avatarUrl;
} 