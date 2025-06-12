package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.AuditDTO;
import ru.musicunity.backend.pojo.Audit;

@Component
public class AuditMapper {
    
    public AuditDTO toDTO(Audit audit) {
        if (audit == null) {
            return null;
        }
        
        AuditDTO dto = new AuditDTO();
        dto.setId(audit.getLogId());
        dto.setModeratorId(audit.getModerator() != null ? audit.getModerator().getUserId() : null);
        dto.setModeratorUsername(audit.getModerator() != null ? audit.getModerator().getUsername() : "Система");
        dto.setTargetId(audit.getTargetId());
        dto.setActionType(audit.getActionType());
        dto.setPerformedAt(audit.getPerformedAt());
        dto.setIsRolledBack(audit.getIsRolledBack() != null ? audit.getIsRolledBack() : false);
        dto.setRollbackAt(audit.getRollbackAt());
        
        return dto;
    }
    
    public Audit toEntity(AuditDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Audit audit = new Audit();
        audit.setLogId(dto.getId());
        audit.setTargetId(dto.getTargetId());
        audit.setActionType(dto.getActionType());
        audit.setPerformedAt(dto.getPerformedAt());
        
        return audit;
    }
} 