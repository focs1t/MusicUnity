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
    Page<Review> findAllByReleaseReleaseId(Long releaseId, Pageable pageable);

    Page<Review> findAllByUserUserId(Long userId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.userId = :userId")
    long countByUser(Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.release.releaseId = :releaseId")
    long countByRelease(Long releaseId);

    @Query("SELECT r FROM Review r")
    Page<Review> findAllSorted(Pageable pageable);
}