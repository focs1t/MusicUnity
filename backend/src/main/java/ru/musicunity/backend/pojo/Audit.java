package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import ru.musicunity.backend.pojo.enums.AuditAction;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "audit",
    indexes = {
        @Index(name = "idx_audit_moderator_id", columnList = "moderator_id"),
        @Index(name = "idx_audit_action_type", columnList = "actionType"),
        @Index(name = "idx_audit_target_id", columnList = "targetId"),
        @Index(name = "idx_audit_performed_at", columnList = "performedAt"),
        @Index(name = "idx_audit_is_rolled_back", columnList = "isRolledBack")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Audit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderator_id", nullable = false)
    private User moderator;

    @Column(nullable = false)
    @Convert(converter = AuditAction.AuditActionConverter.class)
    private AuditAction actionType;

    @Column(nullable = false)
    private Long targetId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime performedAt;
    
    @Column
    @Builder.Default
    private Boolean isRolledBack = false;
    
    @Column
    private LocalDateTime rollbackAt;
}