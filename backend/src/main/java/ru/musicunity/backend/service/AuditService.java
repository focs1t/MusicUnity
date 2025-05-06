package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.pojo.Audit;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.repository.AuditRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository auditRepository;

    public List<Audit> getAuditLogsByModerator(Long moderatorId) {
        return auditRepository.findByModerator(moderatorId);
    }

    public List<Audit> getAuditLogsByTargetId(Long targetId) {
        return auditRepository.findByTargetId(targetId);
    }

    public List<Audit> getAllAuditLogs() {
        return auditRepository.findAll();
    }

    public Page<Audit> getAuditLogsOrderByDateDesc(Pageable pageable) {
        return auditRepository.findAllOrderByPerformedAtDesc(pageable);
    }

    public Page<Audit> getAuditLogsOrderByDateAsc(Pageable pageable) {
        return auditRepository.findAllOrderByPerformedAtAsc(pageable);
    }

    public Page<Audit> getAuditLogsByActionType(AuditAction actionType, Pageable pageable) {
        return auditRepository.findByActionType(actionType, pageable);
    }

    public void deleteAllAuditLogs() {
        auditRepository.deleteAll();
    }

    public Audit getAuditLogById(Long id) {
        return auditRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit log not found with id: " + id));
    }
}
