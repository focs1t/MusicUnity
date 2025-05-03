package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "user_following")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFollowing {

    @EmbeddedId
    private UserFollowingId id;

    @MapsId("followerId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id")
    private User follower;

    @MapsId("followedId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "followed_id")
    private User followed;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserFollowingId implements Serializable {
        private Long followerId;
        private Long followedId;
    }
}