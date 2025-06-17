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
import ru.musicunity.backend.dto.LikeDTO;
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.pojo.enums.LikeType;
import ru.musicunity.backend.service.LikeService;
import ru.musicunity.backend.service.ReviewService;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", exposedHeaders = "*")
@Tag(name = "Лайки", description = "API для управления лайками на отзывы")
public class LikeController {
    private final LikeService likeService;
    private final ReviewService reviewService;
    private static final Logger logger = Logger.getLogger(LikeController.class.getName());

    @Operation(summary = "Получение лайков отзыва")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список лайков")
    })
    @GetMapping("/review/{reviewId}")
    public ResponseEntity<List<LikeDTO>> getLikesByReview(
        @Parameter(description = "ID отзыва") @PathVariable Long reviewId) {
        logger.info("Получение лайков для рецензии ID:" + reviewId);
        List<LikeDTO> likes = likeService.getLikesByReview(reviewId);
        logger.info("Найдено лайков: " + likes.size());
        return ResponseEntity.ok(likes);
    }

    @Operation(summary = "Получение лайков авторов отзыва")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список лайков авторов")
    })
    @GetMapping("/review/{reviewId}/count/author")
    public ResponseEntity<List<LikeDTO>> getAuthorLikesByReview(
        @Parameter(description = "ID отзыва") @PathVariable Long reviewId) {
        logger.info("Получение авторских лайков для рецензии ID:" + reviewId);
        List<LikeDTO> authorLikes = likeService.getAuthorLikesByReview(reviewId);
        logger.info("Найдено авторских лайков: " + authorLikes.size());
        return ResponseEntity.ok(authorLikes);
    }

    @Operation(summary = "Получение всех рецензий с авторскими лайками")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список рецензий с авторскими лайками")
    })
    @GetMapping("/author-likes")
    public ResponseEntity<Page<ReviewDTO>> getAllReviewsWithAuthorLikes(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        logger.info("Получен запрос на /api/likes/author-likes с параметрами пагинации: " + pageable);
        try {
            Page<ReviewDTO> result = likeService.getAllReviewsWithAuthorLikes(pageable);
            logger.info("Успешно получены рецензии с авторскими лайками: " + result.getTotalElements() + " элементов");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Ошибка при получении рецензий с авторскими лайками: " + e.getMessage());
            throw e;
        }
    }

    @Operation(summary = "Получение количества лайков отзыва")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество лайков")
    })
    @GetMapping("/review/{reviewId}/count")
    public ResponseEntity<Long> getLikesCountByReview(
        @Parameter(description = "ID отзыва") @PathVariable Long reviewId) {
        logger.info("Запрос на получение количества лайков для рецензии ID:" + reviewId);
        Long count = likeService.getLikesCountByReview(reviewId);
        logger.info("Количество лайков для рецензии " + reviewId + ": " + count);
        return ResponseEntity.ok(count);
    }

    @Operation(summary = "Получение количества полученных лайков пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество полученных лайков")
    })
    @GetMapping("/user/{userId}/received")
    public ResponseEntity<Long> getReceivedLikesCountByUser(
        @Parameter(description = "ID пользователя") @PathVariable Long userId) {
        logger.info("Запрос на количество полученных лайков для пользователя ID:" + userId);
        return ResponseEntity.ok(likeService.getReceivedLikesCountByUser(userId));
    }

    @Operation(summary = "Получение количества поставленных лайков пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество поставленных лайков")
    })
    @GetMapping("/user/{userId}/given")
    public ResponseEntity<Long> getGivenLikesCountByUser(
        @Parameter(description = "ID пользователя") @PathVariable Long userId) {
        logger.info("Запрос на количество поставленных лайков для пользователя ID:" + userId);
        return ResponseEntity.ok(likeService.getGivenLikesCountByUser(userId));
    }

    @Operation(summary = "Получение количества полученных лайков от авторов")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Количество полученных лайков от авторов")
    })
    @GetMapping("/user/{userId}/received/author")
    public ResponseEntity<Long> getReceivedAuthorLikesCountByUser(
        @Parameter(description = "ID пользователя") @PathVariable Long userId) {
        logger.info("Запрос на количество полученных авторских лайков для пользователя ID:" + userId);
        return ResponseEntity.ok(likeService.getReceivedAuthorLikesCountByUser(userId));
    }
    
    @Operation(summary = "Получение рецензий, лайкнутых пользователем")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список рецензий, которые лайкнул пользователь")
    })
    @GetMapping("/user/{userId}/reviews")
    public ResponseEntity<Page<ReviewDTO>> getLikedReviewsByUser(
        @Parameter(description = "ID пользователя") @PathVariable Long userId,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        logger.info("Запрос на получение лайкнутых рецензий для пользователя ID:" + userId);
        return ResponseEntity.ok(reviewService.getLikedReviewsByUser(userId, pageable));
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
        logger.info("Запрос на создание лайка: reviewId=" + reviewId + ", userId=" + userId + ", type=" + type);
        try {
            LikeDTO createdLike = likeService.createLike(reviewId, userId, type);
            logger.info("Лайк успешно создан: " + createdLike.getLikeId());
            return ResponseEntity.ok(createdLike);
        } catch (Exception e) {
            logger.severe("Ошибка при создании лайка: " + e.getMessage());
            throw e;
        }
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
        logger.info("Запрос на удаление лайка: reviewId=" + reviewId + ", userId=" + userId);
        try {
            likeService.removeLike(reviewId, userId);
            logger.info("Лайк успешно удален");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.severe("Ошибка при удалении лайка: " + e.getMessage());
            throw e;
        }
    }
} 