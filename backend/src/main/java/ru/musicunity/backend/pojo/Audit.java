package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Arrays;

@Entity
@Table(name = "audit")
@Data
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
    @Convert(converter = AuditActionConverter.class)
    private AuditAction actionType;

    @Column(nullable = false)
    private Long targetId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime performedAt;

    public enum AuditAction {
        USER_BLOCK(0), REVIEW_DELETE(1), RELEASE_ADD(2), AUTHOR_ADD(3);

        private final int code;
        AuditAction(int code) { this.code = code; }
        public int getCode() { return code; }
    }

    @Converter(autoApply = true)
    public static class AuditActionConverter implements AttributeConverter<AuditAction, Integer> {
        @Override public Integer convertToDatabaseColumn(AuditAction action) { return action.getCode(); }
        @Override public AuditAction convertToEntityAttribute(Integer code) {
            return Arrays.stream(AuditAction.values())
                    .filter(a -> a.getCode() == code)
                    .findFirst()
                    .orElseThrow(IllegalArgumentException::new);
        }
    }
}