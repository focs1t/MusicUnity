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
@Table(name = "reviews")
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

    @Column(nullable = false, length = 50)
    private String title;

    @Lob
    private String content;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Integer likesCount = 0;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer rhymeImagery = 5;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer structureRhythm = 5;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer styleExecution = 5;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer individuality = 5;

    @Column(nullable = false)
    @Min(1) @Max(10)
    private Integer vibe = 5;

    @Formula("ROUND((rhyme_imagery + structure_rhythm + style_execution + individuality) * (1 + (vibe / 10.0) * 1.5))")
    private Integer totalScore;
}