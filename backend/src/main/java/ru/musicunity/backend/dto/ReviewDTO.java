package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.ReviewType;

import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long reviewId;
    private Long userId;
    private Long releaseId;
    private ReviewType type;
    private String title;
    private String content;
    private Integer rhymeImagery;
    private Integer structureRhythm;
    private Integer styleExecution;
    private Integer individuality;
    private Integer vibe;
    private Integer likesCount;
    private Integer totalScore;
    private LocalDateTime createdAt;
    
    // Дополнительные данные о пользователе (авторе рецензии)
    private UserDTO user;
    
    // Данные о релизе
    private ReleaseDTO release;
    
    // Данные об авторском лайке
    private UserDTO authorLike;
    
    @Data
    public static class UserDTO {
        private Long userId;
        private String username;
        private String avatarUrl;
        private Integer rank; // ранг в топ-100
    }
    
    @Data
    public static class ReleaseDTO {
        private Long releaseId;
        private String title;
        private String coverUrl;
    }
} 