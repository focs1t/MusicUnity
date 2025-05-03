package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "release_genres")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseGenre {

    @EmbeddedId
    private ReleaseGenreId id;

    @MapsId("releaseId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id")
    private Release release;

    @MapsId("genreId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id")
    private Genre genre;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReleaseGenreId implements Serializable {
        private Long releaseId;
        private Long genreId;
    }
}