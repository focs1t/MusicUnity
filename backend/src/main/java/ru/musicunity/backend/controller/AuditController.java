package ru.musicunity.backend.controller;

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
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditDTO>> getAllAuditLogs() {
        return ResponseEntity.ok(auditService.getAllAuditLogs());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditDTO> getAuditLogById(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getAuditLogById(id));
    }

    @GetMapping("/moderator/{moderatorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditDTO>> getAuditLogsByModerator(@PathVariable Long moderatorId) {
        return ResponseEntity.ok(auditService.getAuditLogsByModerator(moderatorId));
    }

    @GetMapping("/target/{targetId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditDTO>> getAuditLogsByTargetId(@PathVariable Long targetId) {
        return ResponseEntity.ok(auditService.getAuditLogsByTargetId(targetId));
    }

    @GetMapping("/newest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditDTO>> getAuditLogsOrderByDateDesc(Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditLogsOrderByDateDesc(pageable));
    }

    @GetMapping("/oldest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditDTO>> getAuditLogsOrderByDateAsc(Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditLogsOrderByDateAsc(pageable));
    }

    @GetMapping("/action/{actionType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditDTO>> getAuditLogsByActionType(
            @PathVariable AuditAction actionType,
            Pageable pageable) {
        return ResponseEntity.ok(auditService.getAuditLogsByActionType(actionType, pageable));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAllAuditLogs() {
        auditService.deleteAllAuditLogs();
        return ResponseEntity.ok().build();
    }
}