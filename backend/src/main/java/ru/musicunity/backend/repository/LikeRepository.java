package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Like;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.LikeType;

import java.util.List;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("SELECT l FROM Like l WHERE l.review.reviewId = :reviewId")
    List<Like> findAllByReviewId(@Param("reviewId") Long reviewId);

    @Query("SELECT l FROM Like l WHERE l.review.reviewId = :reviewId AND l.type = :type")
    List<Like> findAllByReviewIdAndType(@Param("reviewId") Long reviewId, @Param("type") LikeType type);
    
    @Query("SELECT l FROM Like l WHERE l.type = :type ORDER BY l.createdAt DESC")
    List<Like> findAllByType(@Param("type") LikeType type);
    
    @Query("SELECT l FROM Like l WHERE l.type = :type ORDER BY l.createdAt DESC")
    Page<Like> findAllByType(@Param("type") LikeType type, Pageable pageable);
    
    @Query("SELECT DISTINCT l.review FROM Like l WHERE l.type = :type ORDER BY l.createdAt DESC")
    Page<Review> findAllReviewsByLikeType(@Param("type") LikeType type, Pageable pageable);

    Long countByReviewReviewId(Long reviewId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.review.user.userId = :userId")
    Long countByReviewAuthorUserId(Long userId);

    Long countByUserUserId(Long userId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.review.user.userId = :userId AND l.type = :type")
    Long countByReviewAuthorUserIdAndType(Long userId, LikeType type);

    boolean existsByReviewAndUser(Review review, User user);

    void deleteByReviewReviewIdAndUserUserId(Long reviewId, Long userId);
}