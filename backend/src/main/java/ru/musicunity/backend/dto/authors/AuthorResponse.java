package ru.musicunity.backend.dto.authors;

import ru.musicunity.backend.dto.users.UserResponse;
import ru.musicunity.backend.pojo.Author;

import java.time.LocalDateTime;

public record AuthorResponse(
        Long authorId,
        String authorName,
        boolean isVerified,
        UserResponse user,
        String avatarUrl,
        String bio,
        Author.AuthorRole role,
        LocalDateTime createdAt,
        int followingCount
) {}