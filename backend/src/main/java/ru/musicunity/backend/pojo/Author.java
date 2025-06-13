package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "authors",
    indexes = {
        @Index(name = "idx_author_name", columnList = "authorName"),
        @Index(name = "idx_author_is_verified", columnList = "isVerified"),
        @Index(name = "idx_author_is_artist", columnList = "isArtist"),
        @Index(name = "idx_author_is_producer", columnList = "isProducer"),
        @Index(name = "idx_author_is_deleted", columnList = "isDeleted"),
        @Index(name = "idx_author_user_id", columnList = "user_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Author {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long authorId;

    @Column(unique = true, nullable = false, length = 50)
    private String authorName;

    @Column(nullable = false)
    private Boolean isVerified = false;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String avatarUrl;

    @Column(length = 1000)
    private String bio;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Integer followingCount = 0;

    @Column(nullable = false)
    private Boolean isArtist = false;

    @Column(nullable = false)
    private Boolean isProducer = false;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReleaseAuthor> releases = new ArrayList<>();

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserFollowing> followings = new ArrayList<>();

    @Column(nullable = false)
    private Boolean isDeleted = false;
}