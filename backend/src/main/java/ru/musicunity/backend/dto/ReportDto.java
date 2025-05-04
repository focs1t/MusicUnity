package ru.musicunity.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportDto {
    private Long reportId;
    private Long reviewId;
    private Long userId;
    private Long moderatorId;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
} 