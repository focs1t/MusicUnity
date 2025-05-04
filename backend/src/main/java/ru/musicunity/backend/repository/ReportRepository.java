package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Report;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    @Query("SELECT r FROM Report r WHERE r.status = :status ORDER BY r.createdAt DESC")
    Page<Report> findByStatus(Report.ReportStatus status, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.moderator.id = :moderatorId ORDER BY r.createdAt DESC")
    Page<Report> findByModerator(Long moderatorId, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.createdAt BETWEEN :start AND :end ORDER BY r.createdAt DESC")
    Page<Report> findByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.review.id = :reviewId")
    List<Report> findByReviewId(Long reviewId);

    @Query("SELECT r FROM Report r WHERE r.status = ru.musicunity.backend.pojo.Report.ReportStatus.RESOLVED")
    List<Report> findResolved();
}