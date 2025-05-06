package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.UserFollowing;

@Repository
public interface UserFollowingRepository extends JpaRepository<UserFollowing, Long> {
    @Query("SELECT uf FROM UserFollowing uf WHERE uf.userId = :followerId")
    Page<UserFollowing> findByFollower(Long followerId, Pageable pageable);

    @Query("SELECT uf FROM UserFollowing uf WHERE uf.userId = :followedId")
    Page<UserFollowing> findByFollowed(Long followedId, Pageable pageable);

    boolean existsByAuthorAuthorIdAndUserUserId(Long authorId, Long userId);
}