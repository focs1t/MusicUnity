package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Report;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    @Query("SELECT r FROM Report r WHERE r.status = :status")
    List<Report> findByStatus(Report.ReportStatus status);

    @Query("SELECT r FROM Report r WHERE r.user.userId = :userId")
    List<Report> findByReporterId(Long userId);
}