package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Like;

import java.util.List;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("SELECT COUNT(l) FROM Like l WHERE l.review.reviewId = :reviewId")
    Long countByReview(Long reviewId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.user.userId = :userId")
    Long countByUser(Long userId);

    @Query("SELECT l FROM Like l WHERE l.user.userId = :userId")
    List<Like> findByUser(Long userId);

    @Query("SELECT l FROM Like l WHERE l.review.reviewId = :reviewId AND l.user.userId = :userId")
    Like findByReviewAndUser(Long reviewId, Long userId);
}