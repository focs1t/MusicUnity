package ru.musicunity.backend.dto.reviews;

import ru.musicunity.backend.dto.releases.ReleaseResponse;
import ru.musicunity.backend.dto.users.UserResponse;
import ru.musicunity.backend.pojo.Review;

import java.time.LocalDateTime;
import java.util.Map;

public record ReviewResponse(
        Long reviewId,
        UserResponse user,
        ReleaseResponse release,
        Review.ReviewType type,
        String content,
        int totalScore,
        LocalDateTime createdAt,
        int likesCount,
        Map<String, Integer> ratings
) {}