package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.UserFollowing;

import java.util.List;

@Repository
public interface UserFollowingRepository extends JpaRepository<UserFollowing, Long> {
    List<UserFollowing> findByUserUserId(Long userId);
}