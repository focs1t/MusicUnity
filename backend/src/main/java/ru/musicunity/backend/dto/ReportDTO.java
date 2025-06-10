package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.ReportStatus;
import ru.musicunity.backend.pojo.enums.ReportType;

import java.time.LocalDateTime;

@Data
public class ReportDTO {
    private Long reportId;
    private ReportType type;
    private Long targetId;
    private Long reviewId;  // Для обратной совместимости
    private Long userId;
    private Long moderatorId;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
} 