package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Like;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("SELECT * FROM Like l WHERE l.reviewId = :reviewId AND l.type = :type")
    Page<Like> findByReviewAndType(Long reviewId, Like.LikeType type, Pageable pageable);

    @Query("SELECT COUNT(*) FROM Like l WHERE l.reviewId = :reviewId")
    Long countByReview(Long reviewId);

    @Query("SELECT * FROM Like l WHERE l.userId = :userId")
    Page<Like> findByUser(Long userId, Pageable pageable);
}