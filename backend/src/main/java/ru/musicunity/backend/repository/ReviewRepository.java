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
    // Получение рецензий по релизу с сортировкой по дате
    Page<Review> findAllByReleaseReleaseIdOrderByCreatedAtDesc(Long releaseId, Pageable pageable);
    Page<Review> findAllByReleaseReleaseIdOrderByCreatedAtAsc(Long releaseId, Pageable pageable);

    // Получение рецензий по релизу с сортировкой по количеству лайков
    Page<Review> findAllByReleaseReleaseIdOrderByLikesCountDesc(Long releaseId, Pageable pageable);

    // Получение рецензий по пользователю
    Page<Review> findAllByUserUserId(Long userId, Pageable pageable);

    // Подсчет количества рецензий
    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.userId = :userId")
    long countByUser(Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.release.releaseId = :releaseId")
    long countByRelease(Long releaseId);

    // Получение рецензий с сортировкой по общему количеству лайков
    @Query("SELECT r FROM Review r ORDER BY r.likesCount DESC")
    Page<Review> findAllOrderByLikesCountDesc(Pageable pageable);

    // Получение среднего рейтинга по релизу
    @Query("SELECT AVG(r.totalScore) FROM Review r WHERE r.release.releaseId = :releaseId")
    Double getAverageScoreForRelease(Long releaseId);

    // Получение последних 10 рецензий по релизу
    @Query("SELECT r FROM Review r WHERE r.release.releaseId = :releaseId ORDER BY r.createdAt DESC")
    List<Review> findFirst10ByReleaseOrderByCreatedAtDesc(Long releaseId);
}