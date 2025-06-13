package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import ru.musicunity.backend.pojo.enums.ReviewType;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "reviews",
    indexes = {
        @Index(name = "idx_review_user_id", columnList = "user_id"),
        @Index(name = "idx_review_release_id", columnList = "release_id"),
        @Index(name = "idx_review_type", columnList = "type"),
        @Index(name = "idx_review_total_score", columnList = "totalScore"),
        @Index(name = "idx_review_is_deleted", columnList = "isDeleted"),
        @Index(name = "idx_review_created_at", columnList = "createdAt")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_release", columnNames = {"user_id", "release_id"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id", nullable = false)
    private Release release;

    @Column(nullable = false)
    @Convert(converter = ReviewType.ReviewTypeConverter.class)
    private ReviewType type;

    @Column(length = 50)
    private String title;

    @Column(length = 1000)
    private String content;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Integer likesCount = 0;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer rhymeImagery;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer structureRhythm;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer styleExecution;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer individuality;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer vibe;

    @Formula("ROUND((rhyme_imagery + structure_rhythm + style_execution + individuality) * (1 + (vibe / 10.0) * 1.5))")
    private Integer totalScore;

    @Column(nullable = false)
    private Boolean isDeleted = false;
}