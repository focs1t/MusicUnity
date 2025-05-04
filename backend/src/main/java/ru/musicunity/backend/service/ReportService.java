package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.ReportDto;
import ru.musicunity.backend.pojo.Report;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.repository.ReportRepository;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    // Список по статусу
    public List<ReportDto> getByStatus(String status, int page, int size) {
        Report.ReportStatus st = Report.ReportStatus.valueOf(status);
        return reportRepository.findByStatus(st, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Список по модератору
    public List<ReportDto> getByModerator(Long moderatorId, int page, int size) {
        return reportRepository.findByModerator(moderatorId, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Список по диапазону дат
    public List<ReportDto> getByDateRange(LocalDateTime start, LocalDateTime end, int page, int size) {
        return reportRepository.findByDateRange(start, end, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Получить все репорты по рецензии
    public List<ReportDto> getByReview(Long reviewId) {
        return reportRepository.findByReviewId(reviewId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Получить полный репорт
    public ReportDto getReport(Long id) {
        return reportRepository.findById(id).map(this::toDto).orElseThrow();
    }

    // Добавить репорт
    @Transactional
    public void addReport(ReportDto dto) {
        Review review = reviewRepository.findById(dto.getReviewId()).orElseThrow();
        User user = userRepository.findById(dto.getUserId()).orElseThrow();
        Report report = Report.builder()
                .review(review)
                .user(user)
                .reason(dto.getReason())
                .status(Report.ReportStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        reportRepository.save(report);
    }

    // Действие по репорту (назначить модератора, изменить статус)
    @Transactional
    public void actionOnReport(Long reportId, Long moderatorId, String status) {
        Report report = reportRepository.findById(reportId).orElseThrow();
        User moderator = userRepository.findById(moderatorId).orElseThrow();
        report.setModerator(moderator);
        report.setStatus(Report.ReportStatus.valueOf(status));
        report.setResolvedAt(LocalDateTime.now());
        reportRepository.save(report);
    }

    // Удалить все решённые репорты
    @Transactional
    public void clearResolved() {
        List<Report> resolved = reportRepository.findResolved();
        reportRepository.deleteAll(resolved);
    }

    private ReportDto toDto(Report report) {
        ReportDto dto = new ReportDto();
        dto.setReportId(report.getReportId());
        dto.setReviewId(report.getReview().getReviewId());
        dto.setUserId(report.getUser().getUserId());
        dto.setModeratorId(report.getModerator() != null ? report.getModerator().getUserId() : null);
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus().name());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setResolvedAt(report.getResolvedAt());
        return dto;
    }
}
