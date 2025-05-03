package ru.musicunity.backend.dto.users;

import ru.musicunity.backend.pojo.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long userId,
        String username,
        String email,
        String avatarUrl,
        String bio,
        User.UserRole rights,
        LocalDateTime createdAt,
        LocalDateTime lastLogin
) {}