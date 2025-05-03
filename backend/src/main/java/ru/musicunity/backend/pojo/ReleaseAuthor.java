package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "release_authors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseAuthor {

    @EmbeddedId
    private ReleaseAuthorId id;

    @MapsId("releaseId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id")
    private Release release;

    @MapsId("authorId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Author author;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReleaseAuthorId implements Serializable {
        private Long releaseId;
        private Long authorId;
    }
}