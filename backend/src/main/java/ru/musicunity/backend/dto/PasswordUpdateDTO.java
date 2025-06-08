package ru.musicunity.backend.dto;

import lombok.Data;

/**
 * DTO для обновления пароля пользователя
 */
@Data
public class PasswordUpdateDTO {
    private String currentPassword;
    private String newPassword;
} 