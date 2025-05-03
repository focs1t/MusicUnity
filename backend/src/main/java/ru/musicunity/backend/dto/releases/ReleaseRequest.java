package ru.musicunity.backend.dto.releases;

import jakarta.validation.constraints.*;
import ru.musicunity.backend.pojo.Release;

import java.time.LocalDate;
import java.util.Set;

public record ReleaseRequest(
        @NotBlank @Size(max = 200) String title,
        @NotNull Release.ReleaseType type,
        @NotNull @FutureOrPresent LocalDate releaseDate,
        String coverUrl,
        String releaseLink,
        @NotEmpty Set<Long> authorIds,
        @NotEmpty Set<Long> genreIds
) {}