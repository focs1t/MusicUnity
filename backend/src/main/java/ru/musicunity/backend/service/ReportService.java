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
import ru.musicunity.backend.pojo.Audit;
import ru.musicunity.backend.pojo.Report;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.pojo.enums.ReportStatus;
import ru.musicunity.backend.repository.AuditRepository;
import ru.musicunity.backend.repository.ReportRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserService userService;
    private final ReviewService reviewService;
    private final ReleaseService releaseService;
    private final AuthorService authorService;
    private final ReportMapper reportMapper;
    private final UserMapper userMapper;
    private final ReviewMapper reviewMapper;
    private final AuditRepository auditRepository;

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
    @PreAuthorize("hasAnyRole('USER', 'AUTHOR', 'MODERATOR')")
    public ReportDTO createReport(Long reviewId, Long userId, String reason) {
        User user = userMapper.toEntity(userService.getUserById(userId));
        
        // Проверяем, что пользователь не заблокирован
        if (user.getIsBlocked()) {
            throw new UserBlockedException();
        }

        Report report = Report.builder()
                .type(ru.musicunity.backend.pojo.enums.ReportType.REVIEW)
                .targetId(reviewId)
                .user(user)
                .reason(reason)
                .status(ReportStatus.PENDING)
                .build();

        return reportMapper.toDTO(reportRepository.save(report));
    }

    @Transactional
    @PreAuthorize("hasAnyRole('USER', 'AUTHOR', 'MODERATOR')")
    public ReportDTO createUniversalReport(ru.musicunity.backend.pojo.enums.ReportType type, Long targetId, Long userId, String reason) {
        User user = userMapper.toEntity(userService.getUserById(userId));
        
        // Проверяем, что пользователь не заблокирован
        if (user.getIsBlocked()) {
            throw new UserBlockedException();
        }

        // Проверяем различные ограничения в зависимости от типа репорта
        switch (type) {
            case PROFILE:
                // Нельзя репортить себя
                if (targetId.equals(userId)) {
                    throw new IllegalArgumentException("Вы не можете пожаловаться на самого себя");
                }
                break;
                
            case REVIEW:
                // Проверяем, что пользователь не репортит свою рецензию
                Review review = reviewService.getReviewEntityById(targetId);
                if (review.getUser().getUserId().equals(userId)) {
                    throw new IllegalArgumentException("Вы не можете пожаловаться на свою рецензию");
                }
                break;
                
            case AUTHOR:
                // Проверяем, что пользователь не репортит самого себя как автора
                // Здесь targetId - это ID автора, а не пользователя
                // Нужно проверить связь между автором и пользователем
                // Пока просто проверим, что targetId != userId (если они совпадают)
                if (targetId.equals(userId)) {
                    throw new IllegalArgumentException("Вы не можете пожаловаться на себя");
                }
                break;
                
            case RELEASE:
                // Для релизов пока не проверяем авторство, так как это сложная логика
                // с множественными авторами. Просто разрешаем репорт.
                break;
        }

        Report report = Report.builder()
                .type(type)
                .targetId(targetId)
                .user(user)
                .reason(reason)
                .status(ReportStatus.PENDING)
                .build();

        // Поле review удалено - больше не нужно для обратной совместимости

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
        
        // Для репортов типа REVIEW используем targetId как reviewId
        if (report.getType() == ru.musicunity.backend.pojo.enums.ReportType.REVIEW) {
            reviewService.softDeleteReview(report.getTargetId());
        }

        report.setStatus(ReportStatus.RESOLVED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());
        
        // Создаем запись аудита
        Audit audit = Audit.builder()
                .moderator(moderator)
                .actionType(AuditAction.REVIEW_DELETE)
                .targetId(report.getTargetId()) // ID самой рецензии, а не репорта
                .performedAt(LocalDateTime.now())
                .build();
        auditRepository.save(audit);

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
        
        // Для репортов типа REVIEW получаем пользователя через reviewService
        if (report.getType() == ru.musicunity.backend.pojo.enums.ReportType.REVIEW) {
            Review review = reviewService.getReviewEntityById(report.getTargetId());
            User userToBan = review.getUser();
            userService.banUser(userToBan.getUserId());
        }

        report.setStatus(ReportStatus.RESOLVED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());
        
        // Создаем запись аудита - получаем пользователя которого заблокировали
        Long userIdToBan = null;
        if (report.getType() == ru.musicunity.backend.pojo.enums.ReportType.REVIEW) {
            Review review = reviewService.getReviewEntityById(report.getTargetId());
            userIdToBan = review.getUser().getUserId();
        }
        
        Audit audit = Audit.builder()
                .moderator(moderator)
                .actionType(AuditAction.USER_BLOCK)
                .targetId(userIdToBan != null ? userIdToBan : report.getTargetId())
                .performedAt(LocalDateTime.now())
                .build();
        auditRepository.save(audit);

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
        
        // Создаем запись аудита - отклонение репорта больше не записывается в аудит
        // Или заменяем на общее действие
        // Пока убираем аудит для отклонения репортов

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

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public ReportDTO deleteRelease(Long reportId, Long moderatorId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException(reportId));
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new ReportIsPendingException();
        }

        User moderator = userMapper.toEntity(userService.getUserById(moderatorId));
        
        // Для репортов типа RELEASE используем targetId как releaseId
        if (report.getType() == ru.musicunity.backend.pojo.enums.ReportType.RELEASE) {
            releaseService.softDeleteRelease(report.getTargetId());
        }

        report.setStatus(ReportStatus.RESOLVED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());
        
        // Создаем запись аудита
        Audit audit = Audit.builder()
                .moderator(moderator)
                .actionType(AuditAction.RELEASE_DELETE)
                .targetId(report.getTargetId()) // ID самого релиза, а не репорта
                .performedAt(LocalDateTime.now())
                .build();
        auditRepository.save(audit);

        return reportMapper.toDTO(reportRepository.save(report));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public ReportDTO deleteAuthor(Long reportId, Long moderatorId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException(reportId));
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new ReportIsPendingException();
        }

        User moderator = userMapper.toEntity(userService.getUserById(moderatorId));
        
        // Для репортов типа AUTHOR используем targetId как authorId
        if (report.getType() == ru.musicunity.backend.pojo.enums.ReportType.AUTHOR) {
            authorService.softDeleteAuthor(report.getTargetId());
        }

        report.setStatus(ReportStatus.RESOLVED);
        report.setModerator(moderator);
        report.setResolvedAt(LocalDateTime.now());
        
        // Создаем запись аудита
        Audit audit = Audit.builder()
                .moderator(moderator)
                .actionType(AuditAction.AUTHOR_DELETE)
                .targetId(report.getTargetId()) // ID самого автора, а не репорта
                .performedAt(LocalDateTime.now())
                .build();
        auditRepository.save(audit);

        return reportMapper.toDTO(reportRepository.save(report));
    }
}
