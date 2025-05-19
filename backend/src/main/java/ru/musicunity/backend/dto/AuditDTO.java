package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.AuditAction;

import java.time.LocalDateTime;

@Data
public class AuditDTO {
    private Long id;
    private Long moderatorId;
    private Long targetId;
    private AuditAction actionType;
    private String description;
    private LocalDateTime performedAt;
} 