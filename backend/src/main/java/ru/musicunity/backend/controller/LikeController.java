package ru.musicunity.backend.controller;

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
public class LikeController {
    private final LikeService likeService;

    @GetMapping("/review/{reviewId}")
    public ResponseEntity<List<LikeDTO>> getLikesByReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(likeService.getLikesByReview(reviewId));
    }

    @GetMapping("/review/{reviewId}/author")
    public ResponseEntity<List<LikeDTO>> getAuthorLikesByReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(likeService.getAuthorLikesByReview(reviewId));
    }

    @GetMapping("/review/{reviewId}/count")
    public ResponseEntity<Long> getLikesCountByReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(likeService.getLikesCountByReview(reviewId));
    }

    @GetMapping("/user/{userId}/received")
    public ResponseEntity<Long> getReceivedLikesCountByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(likeService.getReceivedLikesCountByUser(userId));
    }

    @GetMapping("/user/{userId}/given")
    public ResponseEntity<Long> getGivenLikesCountByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(likeService.getGivenLikesCountByUser(userId));
    }

    @GetMapping("/user/{userId}/received/author")
    public ResponseEntity<Long> getReceivedAuthorLikesCountByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(likeService.getReceivedAuthorLikesCountByUser(userId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LikeDTO> createLike(
            @RequestParam Long reviewId,
            @RequestParam Long userId,
            @RequestParam LikeType type) {
        return ResponseEntity.ok(likeService.createLike(reviewId, userId, type));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeLike(
            @RequestParam Long reviewId,
            @RequestParam Long userId) {
        likeService.removeLike(reviewId, userId);
        return ResponseEntity.ok().build();
    }
} 