package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.UserFollowing;

import java.util.List;

@Repository
public interface UserFollowingRepository extends JpaRepository<UserFollowing, Long> {
    @Query("SELECT uf FROM UserFollowing uf WHERE uf.user.userId = :userId AND uf.author.isDeleted = false")
    List<UserFollowing> findByUserUserId(@Param("userId") Long userId);
}