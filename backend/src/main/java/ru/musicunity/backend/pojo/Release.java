package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "releases")
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

    @Lob
    private String description;

    @Column(nullable = false)
    @Convert(converter = ReleaseTypeConverter.class)
    private ReleaseType type;

    @Column(nullable = false)
    private LocalDate releaseDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime addedAt;

    private String coverUrl;

    private String releaseLink;

    @Column(nullable = false)
    private Integer favoritesCount = 0;

    @ManyToMany
    @JoinTable(
            name = "release_authors",
            joinColumns = @JoinColumn(name = "release_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    private List<Author> authors = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "release_genres",
            joinColumns = @JoinColumn(name = "release_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private List<Genre> genres = new ArrayList<>();

    @OneToMany(mappedBy = "release", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    public enum ReleaseType {
        ALBUM(0), SINGLE(1), EP(2);

        private final int code;
        ReleaseType(int code) { this.code = code; }
        public int getCode() { return code; }
    }

    @Converter(autoApply = true)
    public static class ReleaseTypeConverter implements AttributeConverter<ReleaseType, Integer> {
        @Override public Integer convertToDatabaseColumn(ReleaseType type) { return type.getCode(); }
        @Override public ReleaseType convertToEntityAttribute(Integer code) {
            return Arrays.stream(ReleaseType.values())
                    .filter(t -> t.getCode() == code)
                    .findFirst()
                    .orElseThrow(IllegalArgumentException::new);
        }
    }
}