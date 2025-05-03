package ru.musicunity.backend.dto.likes;

import jakarta.validation.constraints.NotNull;
import ru.musicunity.backend.pojo.Like;

public record LikeRequest(
        @NotNull Long reviewId,
        @NotNull Like.LikeType type
) {}