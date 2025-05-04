package ru.musicunity.backend.dto;

import lombok.Data;

@Data
public class ReviewDto {
    private Long reviewId;
    private Long userId;
    private Long releaseId;
    private String type;
    private String content;
    private Integer likesCount;
    private Integer totalScore;
} 