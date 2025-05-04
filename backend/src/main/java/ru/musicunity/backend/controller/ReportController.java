package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.ReportDto;
import ru.musicunity.backend.service.ReportService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/status/{status}")
    public List<ReportDto> getByStatus(@PathVariable String status,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size) {
        return reportService.getByStatus(status, page, size);
    }

    @GetMapping("/moderator/{moderatorId}")
    public List<ReportDto> getByModerator(@PathVariable Long moderatorId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        return reportService.getByModerator(moderatorId, page, size);
    }

    @GetMapping("/date-range")
    public List<ReportDto> getByDateRange(@RequestParam String start,
                                          @RequestParam String end,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        LocalDateTime startDt = LocalDateTime.parse(start);
        LocalDateTime endDt = LocalDateTime.parse(end);
        return reportService.getByDateRange(startDt, endDt, page, size);
    }

    @GetMapping("/review/{reviewId}")
    public List<ReportDto> getByReview(@PathVariable Long reviewId) {
        return reportService.getByReview(reviewId);
    }

    @GetMapping("/{id}")
    public ReportDto get(@PathVariable Long id) {
        return reportService.getReport(id);
    }

    @PostMapping
    public void add(@RequestBody ReportDto dto) {
        reportService.addReport(dto);
    }

    @PostMapping("/{id}/action")
    public void action(@PathVariable Long id, @RequestParam Long moderatorId, @RequestParam String status) {
        reportService.actionOnReport(id, moderatorId, status);
    }

    @DeleteMapping("/clear-resolved")
    public void clearResolved() {
        reportService.clearResolved();
    }
}