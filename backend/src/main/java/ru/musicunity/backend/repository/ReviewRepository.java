package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Review;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    @Query("SELECT r FROM Review r WHERE r.user.userId = :userId")
    List<Review> findByUserId(Long userId);

    @Query("SELECT r FROM Review r WHERE r.release.releaseId = :releaseId")
    List<Review> findByReleaseId(Long releaseId);

    @Query("SELECT r FROM Review r ORDER BY r.totalScore DESC LIMIT 10")
    List<Review> findTopRated();
}