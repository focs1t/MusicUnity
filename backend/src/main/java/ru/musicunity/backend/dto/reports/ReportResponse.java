package ru.musicunity.backend.dto.reports;

import ru.musicunity.backend.dto.reviews.ReviewResponse;
import ru.musicunity.backend.dto.users.UserResponse;
import ru.musicunity.backend.pojo.Report;

import java.time.LocalDateTime;

public record ReportResponse(
        Long reportId,
        ReviewResponse review,
        UserResponse reporter,
        UserResponse moderator,
        String reason,
        Report.ReportStatus status,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt
) {}