package ru.musicunity.backend.dto.reviews;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import ru.musicunity.backend.pojo.Review;

public record ReviewRequest(
        @NotNull Review.ReviewType type,
        @NotBlank String content,
        @Min(1) @Max(10) int rhymeImagery,
        @Min(1) @Max(10) int structureRhythm,
        @Min(1) @Max(10) int styleExecution,
        @Min(1) @Max(10) int individuality,
        @Min(1) @Max(10) int vibe,
        @NotNull Long releaseId
) {}