package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.UserFollowing;

import java.util.List;

@Repository
public interface UserFollowingRepository extends JpaRepository<UserFollowing, UserFollowing.UserFollowingId> {
    @Query("SELECT uf FROM UserFollowing uf WHERE uf.follower.userId = :followerId")
    List<UserFollowing> findByFollowerId(Long followerId);

    @Query("SELECT uf FROM UserFollowing uf WHERE uf.followed.userId = :followedId")
    List<UserFollowing> findByFollowedId(Long followedId);

    @Modifying
    @Query("DELETE FROM UserFollowing uf WHERE uf.follower.userId = :followerId AND uf.followed.userId = :followedId")
    void deleteByFollowerAndFollowed(Long followerId, Long followedId);
}