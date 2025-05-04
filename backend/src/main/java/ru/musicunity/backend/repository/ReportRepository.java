package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Report;

import java.time.LocalDateTime;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    @Query("SELECT r FROM Report r WHERE r.status = :status")
    Page<Report> findByStatus(Report.ReportStatus status, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.moderator.userId = :moderatorId")
    Page<Report> findByModerator(Long moderatorId, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.createdAt BETWEEN :start AND :end")
    Page<Report> findByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable);
}