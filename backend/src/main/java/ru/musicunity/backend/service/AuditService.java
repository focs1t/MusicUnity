package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.dto.AuditDTO;
import ru.musicunity.backend.exception.AuditNotFoundException;
import ru.musicunity.backend.mapper.AuditMapper;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.repository.AuditRepository;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository auditRepository;
    private final AuditMapper auditMapper;

    public Page<AuditDTO> getAuditLogsByModerator(Long moderatorId, Pageable pageable) {
        return auditRepository.findByModerator(moderatorId, pageable)
                .map(auditMapper::toDTO);
    }

    public Page<AuditDTO> getAuditLogsByTargetId(Long targetId, Pageable pageable) {
        return auditRepository.findByTargetId(targetId, pageable)
                .map(auditMapper::toDTO);
    }

    public Page<AuditDTO> getAuditLogs(Pageable pageable) {
        return auditRepository.findAllSorted(pageable)
                .map(auditMapper::toDTO);
    }

    public Page<AuditDTO> getAuditLogsByActionType(AuditAction actionType, Pageable pageable) {
        return auditRepository.findByActionType(actionType, pageable)
                .map(auditMapper::toDTO);
    }

    public AuditDTO getAuditLogById(Long id) {
        return auditRepository.findById(id)
                .map(auditMapper::toDTO)
                .orElseThrow(() -> new AuditNotFoundException(id));
    }
}