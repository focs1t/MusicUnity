package ru.musicunity.backend.dto.user_following;

import jakarta.validation.constraints.NotNull;

public record FollowRequest(
        @NotNull Long followedUserId
) {}