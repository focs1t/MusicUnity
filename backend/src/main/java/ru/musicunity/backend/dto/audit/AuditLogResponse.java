package ru.musicunity.backend.dto.audit;

import ru.musicunity.backend.dto.users.UserResponse;
import ru.musicunity.backend.pojo.Audit;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long logId,
        UserResponse moderator,
        Audit.AuditAction actionType,
        Long targetId,
        LocalDateTime performedAt
) {}