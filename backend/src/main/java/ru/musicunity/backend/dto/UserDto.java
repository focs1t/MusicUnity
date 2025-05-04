package ru.musicunity.backend.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long userId;
    private String username;
    private String email;
    private String avatarUrl;
    private String bio;
    private String rights;
} 