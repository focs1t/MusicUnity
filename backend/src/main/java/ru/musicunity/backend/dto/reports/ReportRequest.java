package ru.musicunity.backend.dto.reports;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReportRequest(
        @NotBlank String reason,
        @NotNull Long reviewId
) {}