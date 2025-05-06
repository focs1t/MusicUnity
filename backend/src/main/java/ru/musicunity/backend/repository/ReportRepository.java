package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Report;
import ru.musicunity.backend.pojo.enums.ReportStatus;

import java.time.LocalDateTime;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    // Получение всех репортов с сортировкой по дате создания
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Report> findAllByOrderByCreatedAtAsc(Pageable pageable);

    // Получение репортов по статусу с сортировкой по дате создания
    Page<Report> findAllByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);
    Page<Report> findAllByStatusOrderByCreatedAtAsc(ReportStatus status, Pageable pageable);

    // Удаление репортов по статусу и дате решения
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Report r WHERE r.status = :status AND r.resolvedAt IS NOT NULL AND r.resolvedAt < :date")
    void deleteAllByStatusAndResolvedAtBefore(ReportStatus status, LocalDateTime date);

    // Получение репортов по модератору
    @Query("SELECT r FROM Report r WHERE r.moderator.userId = :moderatorId")
    Page<Report> findByModerator(Long moderatorId, Pageable pageable);

    // Получение репортов по диапазону дат
    @Query("SELECT r FROM Report r WHERE r.createdAt BETWEEN :start AND :end")
    Page<Report> findByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Получение репортов по пользователю
    @Query("SELECT r FROM Report r WHERE r.user.userId = :userId")
    Page<Report> findByUser(Long userId, Pageable pageable);

    // Получение репортов по рецензии
    @Query("SELECT r FROM Report r WHERE r.review.reviewId = :reviewId")
    Page<Report> findByReview(Long reviewId, Pageable pageable);

    // Подсчет количества репортов по статусу
    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = :status")
    long countByStatus(ReportStatus status);
}