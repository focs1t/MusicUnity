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

import java.time.LocalDateTime;
import java.util.Arrays;

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
    @Convert(converter = ReviewTypeConverter.class)
    private ReviewType type;

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

    public enum ReviewType {
        SIMPLE(0), EXTENDED(1);

        private final int code;
        ReviewType(int code) { this.code = code; }
        public int getCode() { return code; }
    }

    @Converter(autoApply = true)
    public static class ReviewTypeConverter implements AttributeConverter<ReviewType, Integer> {
        @Override public Integer convertToDatabaseColumn(ReviewType type) { return type.getCode(); }
        @Override public ReviewType convertToEntityAttribute(Integer code) {
            return Arrays.stream(ReviewType.values())
                    .filter(t -> t.getCode() == code)
                    .findFirst()
                    .orElseThrow(IllegalArgumentException::new);
        }
    }
}