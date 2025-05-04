package ru.musicunity.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditDto {
    private Long logId;
    private Long moderatorId;
    private String actionType;
    private Long targetId;
    private LocalDateTime performedAt;
} 