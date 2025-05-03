package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Like;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("SELECT l FROM Like l WHERE l.user.userId = :userId AND l.review.reviewId = :reviewId")
    Optional<Like> findByUserAndReview(Long userId, Long reviewId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.review.reviewId = :reviewId")
    int countByReviewId(Long reviewId);

    @Query("SELECT l FROM Like l WHERE l.type = :type")
    List<Like> findByType(Like.LikeType type);
}