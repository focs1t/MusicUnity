package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.ReportDTO;
import ru.musicunity.backend.exception.ReportIsPendingException;
import ru.musicunity.backend.exception.ReportNotFoundException;
import ru.musicunity.backend.exception.UserBlockedException;
import ru.musicunity.backend.mapper.ReportMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.mapper.ReviewMapper;
import ru.musicunity.backend.pojo.Report;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReportStatus;
import ru.musicunity.backend.repository.ReportRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserService userService;
    private final ReviewService reviewService;
    private final ReportMapper reportMapper;
    private final UserMapper userMapper;
    private final ReviewMapper reviewMapper;

    public Page<ReportDTO> getAllSorted(Pageable pageable) {
        return reportRepository.findAllSorted(pageable)
                .map(reportMapper::toDTO);
    }

    public ReportDTO getReportById(Long id) {
        return reportRepository.findById(id)
                .map(reportMapper::toDTO)
                .orElseThrow(() -> new ReportNotFoundException(id));
    }

    @Transactional
    @PreAuthorize("hasAnyRole('USER', 'AUTHOR')")
    public ReportDTO createReport(Long reviewId, Long userId, String reason) {
        User user = userMapper.toEntity(userService.getUserById(userId));
        
        // Проверяем, что пользователь не заблокирован
        if (user.getIsBlocked()) {
            throw new UserBlockedException();
        }

        Review review = reviewMapper.toEntity(reviewService.getReviewById(reviewId));

        Report report = Report.builder()
                .review(review)
                .user(user)
                .reason(reason)
                .status(ReportStatus.PENDING)
                .build();

        return reportMapper.toDTO(reportRepository.save(report));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public ReportDTO deleteReview(Long reportId, Long moderatorId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException(reportId));
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new ReportIsPendingException();
        }

        User moderator = userMapper.toEntity(userService.getUserById(moderatorId));
        reviewService.deleteReview(report.getReview().getReviewId());

        report.setStatus(ReportStatus.RESOLVED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());

        return reportMapper.toDTO(reportRepository.save(report));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public ReportDTO banUser(Long reportId, Long moderatorId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException(reportId));
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new ReportIsPendingException();
        }

        User moderator = userMapper.toEntity(userService.getUserById(moderatorId));
        User userToBan = report.getReview().getUser();
        userService.banUser(userToBan.getUserId());

        report.setStatus(ReportStatus.RESOLVED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());

        return reportMapper.toDTO(reportRepository.save(report));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public ReportDTO rejectReport(Long reportId, Long moderatorId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException(reportId));
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new ReportIsPendingException();
        }

        User moderator = userMapper.toEntity(userService.getUserById(moderatorId));

        report.setStatus(ReportStatus.REJECTED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());

        return reportMapper.toDTO(reportRepository.save(report));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void clearResolvedReports() {
        // Удаляем только те репорты, которые были решены более 7 дней назад
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        reportRepository.deleteAllByStatusAndResolvedAtBefore(ReportStatus.RESOLVED, sevenDaysAgo);
    }

    public Page<ReportDTO> getAllByStatus(Pageable pageable) {
        return reportRepository.findAllByStatus(ReportStatus.PENDING, pageable)
                .map(reportMapper::toDTO);
    }

    public Page<ReportDTO> getByModerator(Long moderatorId, Pageable pageable) {
        return reportRepository.findByModerator(moderatorId, pageable)
                .map(reportMapper::toDTO);
    }

    public Page<ReportDTO> getByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return reportRepository.findByDateRange(start, end, pageable)
                .map(reportMapper::toDTO);
    }

    public Page<ReportDTO> getByUser(Long userId, Pageable pageable) {
        return reportRepository.findByUser(userId, pageable)
                .map(reportMapper::toDTO);
    }
}
