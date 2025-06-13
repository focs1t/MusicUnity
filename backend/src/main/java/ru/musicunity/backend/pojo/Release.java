package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import ru.musicunity.backend.pojo.enums.ReleaseType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "releases",
    indexes = {
        @Index(name = "idx_release_title", columnList = "title"),
        @Index(name = "idx_release_type", columnList = "type"),
        @Index(name = "idx_release_date", columnList = "releaseDate"),
        @Index(name = "idx_release_is_deleted", columnList = "isDeleted"),
        @Index(name = "idx_release_favorites_count", columnList = "favoritesCount"),
        @Index(name = "idx_release_added_at", columnList = "addedAt")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Release {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long releaseId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    @Convert(converter = ReleaseType.ReleaseTypeConverter.class)
    private ReleaseType type;

    @Column(nullable = false)
    private LocalDate releaseDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime addedAt;

    private String coverUrl;

    @Column(nullable = false)
    private Integer favoritesCount = 0;

    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReleaseAuthor> authors = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "release_genres",
            joinColumns = @JoinColumn(name = "release_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @Builder.Default
    private List<Genre> genres = new ArrayList<>();

    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Favorite> favorites = new ArrayList<>();

    @Column(nullable = false)
    private Boolean isDeleted = false;
}