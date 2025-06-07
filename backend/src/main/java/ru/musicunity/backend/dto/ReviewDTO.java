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
} 