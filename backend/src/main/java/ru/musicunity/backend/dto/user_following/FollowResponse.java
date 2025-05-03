package ru.musicunity.backend.dto.user_following;

import ru.musicunity.backend.dto.users.UserResponse;

import java.time.LocalDateTime;

public record FollowResponse(
        UserResponse follower,
        UserResponse followed,
        LocalDateTime createdAt
) {}