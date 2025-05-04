package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Like;

import java.util.List;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("SELECT COUNT(l) FROM Like l WHERE l.review.id = :reviewId")
    Long countByReview(Long reviewId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.user.id = :userId")
    Long countByUser(Long userId);

    @Query("SELECT l FROM Like l WHERE l.user.id = :userId")
    List<Like> findByUser(Long userId);

    @Query("SELECT l FROM Like l WHERE l.review.id = :reviewId AND l.user.id = :userId")
    Like findByReviewAndUser(Long reviewId, Long userId);
}