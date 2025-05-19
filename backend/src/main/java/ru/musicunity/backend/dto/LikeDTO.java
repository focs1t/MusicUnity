package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.LikeType;

@Data
public class LikeDTO {
    private Long likeId;
    private Long reviewId;
    private Long userId;
    private LikeType type;
} 