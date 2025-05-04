package ru.musicunity.backend.dto;

import lombok.Data;

@Data
public class LikeDto {
    private Long likeId;
    private Long reviewId;
    private Long userId;
    private String type;
} 