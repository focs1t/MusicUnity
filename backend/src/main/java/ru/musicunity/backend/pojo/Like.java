package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import ru.musicunity.backend.pojo.enums.LikeType;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "likes",
    indexes = {
        @Index(name = "idx_like_user_id", columnList = "user_id"),
        @Index(name = "idx_like_review_id", columnList = "review_id"),
        @Index(name = "idx_like_type", columnList = "type"),
        @Index(name = "idx_like_created_at", columnList = "createdAt")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_review", columnNames = {"user_id", "review_id"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Convert(converter = LikeType.LikeTypeConverter.class)
    private LikeType type;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}