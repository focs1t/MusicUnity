package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import ru.musicunity.backend.pojo.enums.ReportStatus;
import ru.musicunity.backend.pojo.enums.ReportType;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "reports",
    indexes = {
        @Index(name = "idx_report_user_id", columnList = "user_id"),
        @Index(name = "idx_report_moderator_id", columnList = "moderator_id"),
        @Index(name = "idx_report_status", columnList = "status"),
        @Index(name = "idx_report_type", columnList = "type"),
        @Index(name = "idx_report_target_id", columnList = "target_id"),
        @Index(name = "idx_report_created_at", columnList = "createdAt")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @Column(nullable = false)
    @Convert(converter = ReportType.ReportTypeConverter.class)
    private ReportType type;

    // ID объекта, на который жалуются (review_id, author_id, release_id, user_id)
    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderator_id")
    private User moderator;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    @Convert(converter = ReportStatus.ReportStatusConverter.class)
    private ReportStatus status = ReportStatus.PENDING;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;
}