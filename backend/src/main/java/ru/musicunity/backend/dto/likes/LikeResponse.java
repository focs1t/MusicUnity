package ru.musicunity.backend.dto.likes;

import ru.musicunity.backend.dto.reviews.ReviewResponse;
import ru.musicunity.backend.dto.users.UserResponse;
import ru.musicunity.backend.pojo.Like;

import java.time.LocalDateTime;

public record LikeResponse(
        Long likeId,
        UserResponse user,
        ReviewResponse review,
        Like.LikeType type,
        LocalDateTime createdAt
) {}