package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.ReviewDto;
import ru.musicunity.backend.service.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping("/full")
    public void addFull(@RequestBody ReviewDto dto) {
        reviewService.addFullReview(dto);
    }

    @PostMapping("/simple")
    public void addSimple(@RequestBody ReviewDto dto) {
        reviewService.addSimpleReview(dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }

    @GetMapping("/release/{releaseId}/newest")
    public List<ReviewDto> getByReleaseNewest(@PathVariable Long releaseId,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return reviewService.getByReleaseNewest(releaseId, page, size);
    }

    @GetMapping("/popular")
    public List<ReviewDto> getPopular(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        return reviewService.getPopular(page, size);
    }
} 