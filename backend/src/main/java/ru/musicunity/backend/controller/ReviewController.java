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
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Отзывы", description = "API для управления отзывами на музыкальные релизы")
public class ReviewController {
    private final ReviewService reviewService;

    @Operation(summary = "Получение отзыва по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Отзыв найден"),
        @ApiResponse(responseCode = "404", description = "Отзыв не найден")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(
        @Parameter(description = "ID отзыва") @PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @Operation(summary = "Создание простой оценки")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Оценка успешно создана"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные оценки")
    })
    @PostMapping("/simple")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDTO> createSimpleReview(
        @Parameter(description = "ID пользователя") @RequestParam Long userId,
        @Parameter(description = "ID релиза") @RequestParam Long releaseId,
        @Parameter(description = "Оценка рифмы и образности") @RequestParam Integer rhymeImagery,
        @Parameter(description = "Оценка структуры и ритма") @RequestParam Integer structureRhythm,
        @Parameter(description = "Оценка стиля и исполнения") @RequestParam Integer styleExecution,
        @Parameter(description = "Оценка индивидуальности") @RequestParam Integer individuality,
        @Parameter(description = "Оценка вайба") @RequestParam Integer vibe) {
        return ResponseEntity.ok(reviewService.createSimpleReview(
                userId, releaseId, rhymeImagery, structureRhythm,
                styleExecution, individuality, vibe));
    }

    @Operation(summary = "Создание полной рецензии")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Рецензия успешно создана"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные рецензии")
    })
    @PostMapping("/full")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDTO> createFullReview(
        @Parameter(description = "ID пользователя") @RequestParam Long userId,
        @Parameter(description = "ID релиза") @RequestParam Long releaseId,
        @Parameter(description = "Заголовок рецензии") @RequestParam String title,
        @Parameter(description = "Содержание рецензии") @RequestParam String content,
        @Parameter(description = "Оценка рифмы и образности") @RequestParam Integer rhymeImagery,
        @Parameter(description = "Оценка структуры и ритма") @RequestParam Integer structureRhythm,
        @Parameter(description = "Оценка стиля и исполнения") @RequestParam Integer styleExecution,
        @Parameter(description = "Оценка индивидуальности") @RequestParam Integer individuality,
        @Parameter(description = "Оценка вайба") @RequestParam Integer vibe) {
        return ResponseEntity.ok(reviewService.createFullReview(
                userId, releaseId, title, content,
                rhymeImagery, structureRhythm, styleExecution,
                individuality, vibe));
    }

    @Operation(summary = "Получение отзывов на релиз")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список отзывов")
    })
    @GetMapping("/release/{releaseId}/reviews")
    public ResponseEntity<Page<ReviewDTO>> getReviewsByRelease(
        @Parameter(description = "ID релиза") @PathVariable Long releaseId,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(reviewService.getAllByRelease(releaseId, pageable));
    }

    @Operation(summary = "Получение отзывов пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список отзывов")
    })
    @GetMapping("/user/{userId}/reviews")
    public ResponseEntity<Page<ReviewDTO>> getReviewsByUser(
            @Parameter(description = "ID пользователя") @PathVariable Long userId,
            @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(reviewService.getAllByUser(userId, pageable));
    }

    @Operation(summary = "Получение отзывов")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список отзывов")
    })
    @GetMapping
    public ResponseEntity<Page<ReviewDTO>> getReviews(
            @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(reviewService.getAllSorted(pageable));
    }

    @Operation(summary = "Получение количества отзывов пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество отзывов")
    })
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getReviewsCountByUser(
        @Parameter(description = "ID пользователя") @PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsCountByUser(userId));
    }

    @Operation(summary = "Получение количества отзывов на релиз")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество отзывов")
    })
    @GetMapping("/release/{releaseId}/count")
    public ResponseEntity<Long> getReviewsCountByRelease(
        @Parameter(description = "ID релиза") @PathVariable Long releaseId) {
        return ResponseEntity.ok(reviewService.getReviewsCountByRelease(releaseId));
    }

    @Operation(summary = "Мягкое удаление отзыва (только для модераторов)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Отзыв успешно помечен как удаленный"),
        @ApiResponse(responseCode = "403", description = "Нет прав для удаления отзыва"),
        @ApiResponse(responseCode = "404", description = "Отзыв не найден")
    })
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> softDeleteReview(
        @Parameter(description = "ID отзыва") @PathVariable Long id) {
        reviewService.softDeleteReview(id);
        return ResponseEntity.ok().build();
    }
} 