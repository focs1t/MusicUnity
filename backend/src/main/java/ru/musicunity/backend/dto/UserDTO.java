package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.UserRole;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long userId;
    private String username;
    private String email;
    private String bio;
    private String avatarUrl;
    private Long telegramChatId;
    private UserRole rights;
    private Boolean isBlocked;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    
    // Статистика рецензий
    private Long totalReviewsCount;
    private Long extendedReviewsCount;
    private Long simpleReviewsCount;
    
    // Информация о привязанном авторе
    private AuthorDTO linkedAuthor;
} 