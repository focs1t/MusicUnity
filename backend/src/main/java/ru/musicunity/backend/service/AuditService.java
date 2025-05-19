package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.dto.AuditDTO;
import ru.musicunity.backend.mapper.AuditMapper;
import ru.musicunity.backend.pojo.Audit;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.repository.AuditRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository auditRepository;
    private final AuditMapper auditMapper;

    public List<AuditDTO> getAuditLogsByModerator(Long moderatorId) {
        return auditRepository.findByModerator(moderatorId)
                .stream()
                .map(auditMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuditDTO> getAuditLogsByTargetId(Long targetId) {
        return auditRepository.findByTargetId(targetId)
                .stream()
                .map(auditMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuditDTO> getAllAuditLogs() {
        return auditRepository.findAll()
                .stream()
                .map(auditMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Page<AuditDTO> getAuditLogsOrderByDateDesc(Pageable pageable) {
        return auditRepository.findAllOrderByPerformedAtDesc(pageable)
                .map(auditMapper::toDTO);
    }

    public Page<AuditDTO> getAuditLogsOrderByDateAsc(Pageable pageable) {
        return auditRepository.findAllOrderByPerformedAtAsc(pageable)
                .map(auditMapper::toDTO);
    }

    public Page<AuditDTO> getAuditLogsByActionType(AuditAction actionType, Pageable pageable) {
        return auditRepository.findByActionType(actionType, pageable)
                .map(auditMapper::toDTO);
    }

    public void deleteAllAuditLogs() {
        auditRepository.deleteAll();
    }

    public AuditDTO getAuditLogById(Long id) {
        return auditRepository.findById(id)
                .map(auditMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Audit log not found with id: " + id));
    }
}
