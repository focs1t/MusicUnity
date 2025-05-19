package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.ReportDTO;
import ru.musicunity.backend.service.ReportService;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Page<ReportDTO>> getAllReportsNewestFirst(Pageable pageable) {
        return ResponseEntity.ok(reportService.getAllReportsNewestFirst(pageable));
    }

    @GetMapping("/oldest")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Page<ReportDTO>> getAllReportsOldestFirst(Pageable pageable) {
        return ResponseEntity.ok(reportService.getAllReportsOldestFirst(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReportDTO> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'AUTHOR')")
    public ResponseEntity<ReportDTO> createReport(
            @RequestParam Long reviewId,
            @RequestParam Long userId,
            @RequestParam String reason) {
        return ResponseEntity.ok(reportService.createReport(reviewId, userId, reason));
    }

    @PostMapping("/{reportId}/delete-review")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReportDTO> deleteReview(
            @PathVariable Long reportId,
            @RequestParam Long moderatorId) {
        return ResponseEntity.ok(reportService.deleteReview(reportId, moderatorId));
    }

    @PostMapping("/{reportId}/ban-user")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReportDTO> banUser(
            @PathVariable Long reportId,
            @RequestParam Long moderatorId) {
        return ResponseEntity.ok(reportService.banUser(reportId, moderatorId));
    }

    @PostMapping("/{reportId}/reject")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReportDTO> rejectReport(
            @PathVariable Long reportId,
            @RequestParam Long moderatorId) {
        return ResponseEntity.ok(reportService.rejectReport(reportId, moderatorId));
    }

    @DeleteMapping("/resolved")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> clearResolvedReports() {
        reportService.clearResolvedReports();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Page<ReportDTO>> getPendingReportsNewestFirst(Pageable pageable) {
        return ResponseEntity.ok(reportService.getPendingReportsNewestFirst(pageable));
    }

    @GetMapping("/pending/oldest")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Page<ReportDTO>> getPendingReportsOldestFirst(Pageable pageable) {
        return ResponseEntity.ok(reportService.getPendingReportsOldestFirst(pageable));
    }
}