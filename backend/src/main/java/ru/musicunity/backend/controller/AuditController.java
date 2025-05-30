package ru.musicunity.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.AuditDTO;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.service.AuditService;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Tag(name = "Аудит", description = "API для управления аудитом действий пользователей")
public class AuditController {
    private final AuditService auditService;

    @Operation(summary = "Получение записей аудита по ID модератора")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список записей аудита модератора"),
        @ApiResponse(responseCode = "403", description = "Доступ запрещен")
    })
    @GetMapping("/moderator/{moderatorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditDTO>> getAuditLogsByModerator(
        @Parameter(description = "ID модератора") @PathVariable Long moderatorId,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditLogsByModerator(moderatorId, pageable));
    }

    @Operation(summary = "Получение записей аудита по ID цели")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список записей аудита по цели"),
        @ApiResponse(responseCode = "403", description = "Доступ запрещен")
    })
    @GetMapping("/target/{targetId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditDTO>> getAuditLogsByTargetId(
        @Parameter(description = "ID цели") @PathVariable Long targetId,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditLogsByTargetId(targetId, pageable));
    }

    @Operation(summary = "Получение записей аудита по типу действия")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список записей аудита по типу действия"),
        @ApiResponse(responseCode = "403", description = "Доступ запрещен")
    })
    @GetMapping("/action/{actionType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditDTO>> getAuditLogsByActionType(
        @Parameter(description = "Тип действия") @PathVariable AuditAction actionType,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditLogsByActionType(actionType, pageable));
    }

    @Operation(summary = "Получение записей аудита")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список записей аудита"),
        @ApiResponse(responseCode = "403", description = "Доступ запрещен")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditDTO>> getAuditLogs(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditLogs(pageable));
    }

    @Operation(summary = "Получение записи аудита по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Запись аудита"),
        @ApiResponse(responseCode = "403", description = "Доступ запрещен"),
        @ApiResponse(responseCode = "404", description = "Запись не найдена")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditDTO> getAuditLogById(
        @Parameter(description = "ID записи аудита") @PathVariable Long id) {
        return ResponseEntity.ok(auditService.getAuditLogById(id));
    }
}