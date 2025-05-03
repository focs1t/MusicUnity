package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "user_favorites")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFavorite {

    @EmbeddedId
    private UserFavoriteId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @MapsId("releaseId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "release_id")
    private Release release;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserFavoriteId implements Serializable {
        private Long userId;
        private Long releaseId;
    }
}