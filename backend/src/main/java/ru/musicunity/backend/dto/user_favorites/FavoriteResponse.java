package ru.musicunity.backend.dto.user_favorites;

import ru.musicunity.backend.dto.releases.ReleaseResponse;
import ru.musicunity.backend.dto.users.UserResponse;

import java.time.LocalDateTime;

public record FavoriteResponse(
        UserResponse user,
        ReleaseResponse release,
        LocalDateTime addedAt
) {}