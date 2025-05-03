package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Arrays;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderator_id")
    private User moderator;

    @Lob
    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    @Convert(converter = ReportStatusConverter.class)
    private ReportStatus status = ReportStatus.PENDING;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    public enum ReportStatus {
        PENDING(0), RESOLVED(1), REJECTED(2);

        private final int code;
        ReportStatus(int code) { this.code = code; }
        public int getCode() { return code; }
    }

    @Converter(autoApply = true)
    public static class ReportStatusConverter implements AttributeConverter<ReportStatus, Integer> {
        @Override public Integer convertToDatabaseColumn(ReportStatus status) { return status.getCode(); }
        @Override public ReportStatus convertToEntityAttribute(Integer code) {
            return Arrays.stream(ReportStatus.values())
                    .filter(s -> s.getCode() == code)
                    .findFirst()
                    .orElseThrow(IllegalArgumentException::new);
        }
    }
}