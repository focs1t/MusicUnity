package ru.musicunity.backend.dto.release_genres;

import jakarta.validation.constraints.NotNull;

public record ReleaseGenreRequest(
        @NotNull Long releaseId,
        @NotNull Long genreId
) {}