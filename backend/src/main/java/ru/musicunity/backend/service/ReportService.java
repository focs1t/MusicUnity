package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.pojo.Report;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReportStatus;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.ReportRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserService userService;
    private final ReviewService reviewService;

    public Page<Report> getAllReportsNewestFirst(Pageable pageable) {
        return reportRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<Report> getAllReportsOldestFirst(Pageable pageable) {
        return reportRepository.findAllByOrderByCreatedAtAsc(pageable);
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + id));
    }

    @Transactional
    @PreAuthorize("hasAnyRole('USER', 'AUTHOR')")
    public Report createReport(Long reviewId, Long userId, String reason) {
        User user = userService.getUserById(userId);
        
        // Проверяем, что пользователь имеет роль USER или AUTHOR
        if (user.getRights() != UserRole.REGULAR && user.getRights() != UserRole.AUTHOR) {
            throw new RuntimeException("Only users and authors can create reports");
        }

        Review review = reviewService.getReviewById(reviewId);

        Report report = Report.builder()
                .review(review)
                .user(user)
                .reason(reason)
                .status(ReportStatus.PENDING)
                .build();

        return reportRepository.save(report);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public Report deleteReview(Long reportId, Long moderatorId) {
        Report report = getReportById(reportId);
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new RuntimeException("Report is not pending");
        }

        User moderator = userService.getUserById(moderatorId);
        reviewService.deleteReview(report.getReview().getReviewId());

        report.setStatus(ReportStatus.RESOLVED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public Report banUser(Long reportId, Long moderatorId) {
        Report report = getReportById(reportId);
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new RuntimeException("Report is not pending");
        }

        User moderator = userService.getUserById(moderatorId);
        User userToBan = report.getReview().getUser();
        userService.banUser(userToBan.getUserId());

        report.setStatus(ReportStatus.RESOLVED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public Report rejectReport(Long reportId, Long moderatorId) {
        Report report = getReportById(reportId);
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new RuntimeException("Report is not pending");
        }

        User moderator = userService.getUserById(moderatorId);

        report.setStatus(ReportStatus.REJECTED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void clearResolvedReports() {
        // Удаляем только те репорты, которые были решены более 7 дней назад
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        reportRepository.deleteAllByStatusAndResolvedAtBefore(ReportStatus.RESOLVED, sevenDaysAgo);
    }

    public Page<Report> getPendingReportsNewestFirst(Pageable pageable) {
        return reportRepository.findAllByStatusOrderByCreatedAtDesc(ReportStatus.PENDING, pageable);
    }

    public Page<Report> getPendingReportsOldestFirst(Pageable pageable) {
        return reportRepository.findAllByStatusOrderByCreatedAtAsc(ReportStatus.PENDING, pageable);
    }
}
