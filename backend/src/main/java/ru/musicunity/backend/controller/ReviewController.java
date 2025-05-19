package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.service.ReviewService;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @PostMapping("/full")
    public ResponseEntity<ReviewDTO> createFullReview(
            @RequestParam Long userId,
            @RequestParam Long releaseId,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam Integer rhymeImagery,
            @RequestParam Integer structureRhythm,
            @RequestParam Integer styleExecution,
            @RequestParam Integer individuality,
            @RequestParam Integer vibe) {
        return ResponseEntity.ok(reviewService.createFullReview(
                userId, releaseId, title, content,
                rhymeImagery, structureRhythm, styleExecution,
                individuality, vibe));
    }

    @PostMapping("/simple")
    public ResponseEntity<ReviewDTO> createSimpleReview(
            @RequestParam Long userId,
            @RequestParam Long releaseId,
            @RequestParam String title,
            @RequestParam String content) {
        return ResponseEntity.ok(reviewService.createSimpleReview(
                userId, releaseId, title, content));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/release/{releaseId}/newest")
    public ResponseEntity<Page<ReviewDTO>> getReviewsByReleaseNewestFirst(
            @PathVariable Long releaseId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByReleaseNewestFirst(releaseId, pageable));
    }

    @GetMapping("/release/{releaseId}/oldest")
    public ResponseEntity<Page<ReviewDTO>> getReviewsByReleaseOldestFirst(
            @PathVariable Long releaseId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByReleaseOldestFirst(releaseId, pageable));
    }

    @GetMapping("/release/{releaseId}/likes")
    public ResponseEntity<Page<ReviewDTO>> getReviewsByLikesCount(
            @PathVariable Long releaseId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByLikesCount(releaseId, pageable));
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getReviewsCountByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsCountByUser(userId));
    }

    @GetMapping("/release/{releaseId}/count")
    public ResponseEntity<Long> getReviewsCountByRelease(@PathVariable Long releaseId) {
        return ResponseEntity.ok(reviewService.getReviewsCountByRelease(releaseId));
    }

    @GetMapping("/top")
    public ResponseEntity<Page<ReviewDTO>> getAllReviewsByLikesCount(Pageable pageable) {
        return ResponseEntity.ok(reviewService.getAllReviewsByLikesCount(pageable));
    }
} 