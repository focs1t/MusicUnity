package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.User;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long userId;
    private String username;
    private String email;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private User.UserRole rights;

    public static UserDto fromUser(User user) {
        UserDto dto = new UserDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        dto.setRights(user.getRights());
        return dto;
    }
} 