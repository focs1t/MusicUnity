package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.LikeDto;
import ru.musicunity.backend.service.LikeService;

import java.util.List;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @GetMapping("/review/{reviewId}/count")
    public Long countByReview(@PathVariable Long reviewId) {
        return likeService.countByReview(reviewId);
    }

    @GetMapping("/user/{userId}/count")
    public Long countByUser(@PathVariable Long userId) {
        return likeService.countByUser(userId);
    }

    @GetMapping("/user/{userId}")
    public List<LikeDto> getLikesByUser(@PathVariable Long userId) {
        return likeService.getLikesByUser(userId);
    }

    @PostMapping
    public void add(@RequestBody LikeDto dto) {
        likeService.addLike(dto);
    }

    @DeleteMapping
    public void remove(@RequestParam Long reviewId, @RequestParam Long userId) {
        likeService.removeLike(reviewId, userId);
    }
} 