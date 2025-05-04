package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Review;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    @Query("SELECT r FROM Review r WHERE r.release.releaseId = :releaseId ORDER BY r.createdAt DESC")
    Page<Review> findByReleaseNewest(Long releaseId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.release.releaseId = :releaseId ORDER BY r.createdAt ASC")
    Page<Review> findByReleaseOldest(Long releaseId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.releaseId = :releaseId")
    Page<Review> findByRelease(Long releaseId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.user.userId = :userId")
    Page<Review> findByUser(Long userId, Pageable pageable);

    @Query("SELECT AVG(r.totalScore) FROM Review r WHERE r.releaseId = :releaseId")
    Double getAverageScoreForRelease(Long releaseId);

    @Query("SELECT r FROM Review r ORDER BY r.likesCount DESC")
    Page<Review> findPopularReviews(Pageable pageable);

    @Query("SELECT AVG(r.totalScore) FROM Review r WHERE r.authorId = :authorId")
    Double getAverageScoreByAuthor(Long authorId);

    @Query("SELECT r FROM Review r WHERE r.authorId = :authorId ORDER BY r.createdAt DESC LIMIT 10")
    List<Review> findFirst10ByAuthorOrderByCreatedAtDesc(Long authorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.userId = :userId")
    long countByUser(Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.release.releaseId = :releaseId")
    long countByRelease(Long releaseId);
}