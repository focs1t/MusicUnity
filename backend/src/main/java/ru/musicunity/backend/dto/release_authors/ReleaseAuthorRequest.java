package ru.musicunity.backend.dto.release_authors;

import jakarta.validation.constraints.NotNull;

public record ReleaseAuthorRequest(
        @NotNull Long releaseId,
        @NotNull Long authorId
) {}