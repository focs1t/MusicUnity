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
    @Query(value = "SELECT r FROM Report r",
           countQuery = "SELECT COUNT(r) FROM Report r")
    Page<Report> findAllSorted(Pageable pageable);

    Page<Report> findAllByStatus(ReportStatus status, Pageable pageable);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Report r WHERE r.status = :status AND r.resolvedAt IS NOT NULL AND r.resolvedAt < :date")
    void deleteAllByStatusAndResolvedAtBefore(ReportStatus status, LocalDateTime date);

    @Query("SELECT r FROM Report r WHERE r.moderator.userId = :moderatorId")
    Page<Report> findByModerator(Long moderatorId, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.createdAt BETWEEN :start AND :end")
    Page<Report> findByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.user.userId = :userId")
    Page<Report> findByUser(Long userId, Pageable pageable);
}