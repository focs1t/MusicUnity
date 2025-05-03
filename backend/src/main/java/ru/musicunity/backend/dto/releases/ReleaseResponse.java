package ru.musicunity.backend.dto.releases;

import ru.musicunity.backend.dto.authors.AuthorResponse;
import ru.musicunity.backend.dto.genres.GenreResponse;
import ru.musicunity.backend.pojo.Release;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

public record ReleaseResponse(
        Long releaseId,
        String title,
        Release.ReleaseType type,
        LocalDate releaseDate,
        String coverUrl,
        String releaseLink,
        int favoritesCount,
        LocalDateTime addedAt,
        Set<AuthorResponse> authors,
        Set<GenreResponse> genres
) {}