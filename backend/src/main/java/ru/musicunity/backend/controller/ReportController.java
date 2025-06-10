package ru.musicunity.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.ReportDTO;
import ru.musicunity.backend.pojo.enums.ReportStatus;
import ru.musicunity.backend.pojo.enums.ReportType;
import ru.musicunity.backend.service.ReportService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Жалобы", description = "API для управления жалобами на отзывы")
public class ReportController {
    private final ReportService reportService;

    @Operation(summary = "Получение всех жалоб")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список жалоб"),
        @ApiResponse(responseCode = "403", description = "Нет прав для просмотра жалоб")
    })
    @GetMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Page<ReportDTO>> getAllReports(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(reportService.getAllSorted(pageable));
    }

    @Operation(summary = "Получение жалобы по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Жалоба найдена"),
        @ApiResponse(responseCode = "403", description = "Нет прав для просмотра жалобы"),
        @ApiResponse(responseCode = "404", description = "Жалоба не найдена")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReportDTO> getReportById(
        @Parameter(description = "ID жалобы") @PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @Operation(summary = "Создание жалобы")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Жалоба успешно создана"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные жалобы"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReportDTO> createReport(
        @Parameter(description = "ID отзыва") @RequestParam Long reviewId,
        @Parameter(description = "ID пользователя") @RequestParam Long userId,
        @Parameter(description = "Причина жалобы") @RequestParam String reason) {
        return ResponseEntity.ok(reportService.createReport(reviewId, userId, reason));
    }

    @Operation(summary = "Создание универсальной жалобы")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Жалоба успешно создана"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные жалобы"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @PostMapping("/universal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReportDTO> createUniversalReport(
        @Parameter(description = "Тип жалобы") @RequestParam String type,
        @Parameter(description = "ID объекта") @RequestParam Long targetId,
        @Parameter(description = "ID пользователя") @RequestParam Long userId,
        @Parameter(description = "Причина жалобы") @RequestParam String reason) {
        ReportType reportType = ReportType.valueOf(type);
        return ResponseEntity.ok(reportService.createUniversalReport(reportType, targetId, userId, reason));
    }

    @Operation(summary = "Удаление отзыва по жалобе")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Отзыв успешно удален"),
        @ApiResponse(responseCode = "403", description = "Нет прав для удаления отзыва"),
        @ApiResponse(responseCode = "404", description = "Жалоба не найдена")
    })
    @PatchMapping("/{reportId}/delete-review")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReportDTO> deleteReview(
        @Parameter(description = "ID жалобы") @PathVariable Long reportId,
        @Parameter(description = "ID модератора") @RequestParam Long moderatorId) {
        return ResponseEntity.ok(reportService.deleteReview(reportId, moderatorId));
    }

    @Operation(summary = "Блокировка пользователя по жалобе")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Пользователь успешно заблокирован"),
        @ApiResponse(responseCode = "403", description = "Нет прав для блокировки пользователя"),
        @ApiResponse(responseCode = "404", description = "Жалоба не найдена")
    })
    @PatchMapping("/{reportId}/ban-user")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReportDTO> banUser(
        @Parameter(description = "ID жалобы") @PathVariable Long reportId,
        @Parameter(description = "ID модератора") @RequestParam Long moderatorId) {
        return ResponseEntity.ok(reportService.banUser(reportId, moderatorId));
    }

    @Operation(summary = "Отклонение жалобы")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Жалоба успешно отклонена"),
        @ApiResponse(responseCode = "403", description = "Нет прав для отклонения жалобы"),
        @ApiResponse(responseCode = "404", description = "Жалоба не найдена")
    })
    @PatchMapping("/{reportId}/reject")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReportDTO> rejectReport(
        @Parameter(description = "ID жалобы") @PathVariable Long reportId,
        @Parameter(description = "ID модератора") @RequestParam Long moderatorId) {
        return ResponseEntity.ok(reportService.rejectReport(reportId, moderatorId));
    }

    @Operation(summary = "Получение ожидающих жалоб")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список жалоб"),
        @ApiResponse(responseCode = "403", description = "Нет прав для просмотра жалоб")
    })
    @GetMapping("/pending")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Page<ReportDTO>> getPendingReports(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(reportService.getAllByStatus(pageable));
    }

    @Operation(summary = "Получение жалоб по модератору")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список жалоб"),
            @ApiResponse(responseCode = "403", description = "Нет прав для просмотра жалоб")
    })
    @GetMapping("/moderator/{reportId}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Page<ReportDTO>> getByModerators(
            @Parameter(description = "ID модератора") @PathVariable Long moderatorId,
            @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(reportService.getByModerator(moderatorId, pageable));
    }

    @Operation(summary = "Получение жалоб по пользователю")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список жалоб"),
            @ApiResponse(responseCode = "403", description = "Нет прав для просмотра жалоб")
    })
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Page<ReportDTO>> getByUsers(
            @Parameter(description = "ID пользователя") @PathVariable Long userId,
            @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(reportService.getByUser(userId, pageable));
    }

    @Operation(summary = "Получение жалоб по промежутку дат")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список жалоб"),
            @ApiResponse(responseCode = "403", description = "Нет прав для просмотра жалоб")
    })
    @GetMapping("/date/from{start}to/{end}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Page<ReportDTO>> getByDateRange(
            @Parameter(description = "С") @PathVariable LocalDateTime start,
            @Parameter(description = "ПО") @PathVariable LocalDateTime end,
            @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(reportService.getByDateRange(start, end, pageable));
    }
}