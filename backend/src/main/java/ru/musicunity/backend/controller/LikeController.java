package ru.musicunity.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.LikeDTO;
import ru.musicunity.backend.pojo.enums.LikeType;
import ru.musicunity.backend.service.LikeService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/likes")
@RequiredArgsConstructor
@Tag(name = "Лайки", description = "API для управления лайками на отзывы")
public class LikeController {
    private final LikeService likeService;

    @Operation(summary = "Получение лайков отзыва")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список лайков")
    })
    @GetMapping("/review/{reviewId}")
    public ResponseEntity<List<LikeDTO>> getLikesByReview(
        @Parameter(description = "ID отзыва") @PathVariable Long reviewId) {
        return ResponseEntity.ok(likeService.getLikesByReview(reviewId));
    }

    @Operation(summary = "Получение лайков авторов отзыва")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список лайков авторов")
    })
    @GetMapping("/review/{reviewId}/author")
    public ResponseEntity<List<LikeDTO>> getAuthorLikesByReview(
        @Parameter(description = "ID отзыва") @PathVariable Long reviewId) {
        return ResponseEntity.ok(likeService.getAuthorLikesByReview(reviewId));
    }

    @Operation(summary = "Получение количества лайков отзыва")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество лайков")
    })
    @GetMapping("/review/{reviewId}/count")
    public ResponseEntity<Long> getLikesCountByReview(
        @Parameter(description = "ID отзыва") @PathVariable Long reviewId) {
        return ResponseEntity.ok(likeService.getLikesCountByReview(reviewId));
    }

    @Operation(summary = "Получение количества полученных лайков пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество полученных лайков")
    })
    @GetMapping("/user/{userId}/received")
    public ResponseEntity<Long> getReceivedLikesCountByUser(
        @Parameter(description = "ID пользователя") @PathVariable Long userId) {
        return ResponseEntity.ok(likeService.getReceivedLikesCountByUser(userId));
    }

    @Operation(summary = "Получение количества поставленных лайков пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество поставленных лайков")
    })
    @GetMapping("/user/{userId}/given")
    public ResponseEntity<Long> getGivenLikesCountByUser(
        @Parameter(description = "ID пользователя") @PathVariable Long userId) {
        return ResponseEntity.ok(likeService.getGivenLikesCountByUser(userId));
    }

    @Operation(summary = "Получение количества полученных лайков от авторов")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество полученных лайков от авторов")
    })
    @GetMapping("/user/{userId}/received/author")
    public ResponseEntity<Long> getReceivedAuthorLikesCountByUser(
        @Parameter(description = "ID пользователя") @PathVariable Long userId) {
        return ResponseEntity.ok(likeService.getReceivedAuthorLikesCountByUser(userId));
    }

    @Operation(summary = "Создание лайка")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Лайк успешно создан"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LikeDTO> createLike(
        @Parameter(description = "ID отзыва") @RequestParam Long reviewId,
        @Parameter(description = "ID пользователя") @RequestParam Long userId,
        @Parameter(description = "Тип лайка") @RequestParam LikeType type) {
        return ResponseEntity.ok(likeService.createLike(reviewId, userId, type));
    }

    @Operation(summary = "Удаление лайка")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Лайк успешно удален"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeLike(
        @Parameter(description = "ID отзыва") @RequestParam Long reviewId,
        @Parameter(description = "ID пользователя") @RequestParam Long userId) {
        likeService.removeLike(reviewId, userId);
        return ResponseEntity.ok().build();
    }
} 