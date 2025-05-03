package ru.musicunity.backend.dto.user_favorites;

import jakarta.validation.constraints.NotNull;

public record FavoriteRequest(
        @NotNull Long releaseId
) {}