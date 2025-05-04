package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.dto.ReviewDto;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.repository.UserRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.exception.UserNotFoundException;
import ru.musicunity.backend.exception.ReleaseNotFoundException;
import ru.musicunity.backend.exception.ReviewNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ReleaseRepository releaseRepository;

    // Добавить полную рецензию
    public void addFullReview(ReviewDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("" + dto.getUserId()));
        Release release = releaseRepository.findById(dto.getReleaseId())
                .orElseThrow(() -> new ReleaseNotFoundException(dto.getReleaseId()));
        Review review = Review.builder()
                .user(user)
                .release(release)
                .type(Review.ReviewType.EXTENDED)
                .content(dto.getContent())
                .build();
        reviewRepository.save(review);
    }

    // Добавить простую рецензию
    public void addSimpleReview(ReviewDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException("" + dto.getUserId()));
        Release release = releaseRepository.findById(dto.getReleaseId())
                .orElseThrow(() -> new ReleaseNotFoundException(dto.getReleaseId()));
        Review review = Review.builder()
                .user(user)
                .release(release)
                .type(Review.ReviewType.SIMPLE)
                .content(dto.getContent())
                .build();
        reviewRepository.save(review);
    }

    // Удалить рецензию (модер)
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ReviewNotFoundException(reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    // Список по релизу с сортировкой по дате (новые)
    public List<ReviewDto> getByReleaseNewest(Long releaseId, int page, int size) {
        return reviewRepository.findByReleaseNewest(releaseId, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Список по релизу с сортировкой по дате (старые)
    public List<ReviewDto> getByReleaseOldest(Long releaseId, int page, int size) {
        return reviewRepository.findByReleaseOldest(releaseId, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Список с сортировкой по кол-ву лайков
    public List<ReviewDto> getPopular(int page, int size) {
        return reviewRepository.findPopularReviews(PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public long countByUser(Long userId) {
        return reviewRepository.countByUser(userId);
    }

    public long countByRelease(Long releaseId) {
        return reviewRepository.countByRelease(releaseId);
    }

    public List<ReviewDto> getRecentReviews(int page, int size) {
        return reviewRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ReviewDto toDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setReviewId(review.getReviewId());
        dto.setUserId(review.getUser().getUserId());
        dto.setReleaseId(review.getRelease().getReleaseId());
        dto.setType(review.getType().name());
        dto.setContent(review.getContent());
        dto.setLikesCount(review.getLikesCount());
        dto.setTotalScore(review.getTotalScore());
        return dto;
    }
}
