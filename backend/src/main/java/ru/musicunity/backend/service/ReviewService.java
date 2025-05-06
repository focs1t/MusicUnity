package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReviewType;
import ru.musicunity.backend.repository.ReviewRepository;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final ReleaseService releaseService;

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
    }

    private void checkIfUserIsAuthor(Release release, User user) {
        boolean isAuthor = release.getAuthors().stream()
                .anyMatch(releaseAuthor -> releaseAuthor.getAuthor().getUser() != null &&
                        releaseAuthor.getAuthor().getUser().getUserId().equals(user.getUserId()));
        if (isAuthor) {
            throw new RuntimeException("Author cannot review their own release");
        }
    }

    @Transactional
    public Review createFullReview(Long userId, Long releaseId, String title, String content,
                                   Integer rhymeImagery, Integer structureRhythm, Integer styleExecution,
                                   Integer individuality, Integer vibe) {
        User user = userService.getUserById(userId);
        Release release = releaseService.getReleaseById(releaseId);

        checkIfUserIsAuthor(release, user);

        Review review = Review.builder()
                .user(user)
                .release(release)
                .type(ReviewType.EXTENDED)
                .title(title)
                .content(content)
                .rhymeImagery(rhymeImagery)
                .structureRhythm(structureRhythm)
                .styleExecution(styleExecution)
                .individuality(individuality)
                .vibe(vibe)
                .likesCount(0)
                .build();

        return reviewRepository.save(review);
    }

    @Transactional
    public Review createSimpleReview(Long userId, Long releaseId, String title, String content) {
        User user = userService.getUserById(userId);
        Release release = releaseService.getReleaseById(releaseId);

        checkIfUserIsAuthor(release, user);

        Review review = Review.builder()
                .user(user)
                .release(release)
                .type(ReviewType.SIMPLE)
                .title(title)
                .content(content)
                .likesCount(0)
                .build();

        return reviewRepository.save(review);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void deleteReview(Long reviewId) {
        Review review = getReviewById(reviewId);
        reviewRepository.delete(review);
    }

    public Page<Review> getReviewsByReleaseNewestFirst(Long releaseId, Pageable pageable) {
        return reviewRepository.findAllByReleaseReleaseIdOrderByCreatedAtDesc(releaseId, pageable);
    }

    public Page<Review> getReviewsByReleaseOldestFirst(Long releaseId, Pageable pageable) {
        return reviewRepository.findAllByReleaseReleaseIdOrderByCreatedAtAsc(releaseId, pageable);
    }

    public Page<Review> getReviewsByLikesCount(Long releaseId, Pageable pageable) {
        return reviewRepository.findAllByReleaseReleaseIdOrderByLikesCountDesc(releaseId, pageable);
    }

    public long getReviewsCountByUser(Long userId) {
        return reviewRepository.countByUser(userId);
    }

    public long getReviewsCountByRelease(Long releaseId) {
        return reviewRepository.countByRelease(releaseId);
    }

    public Page<Review> getAllReviewsByLikesCount(Pageable pageable) {
        return reviewRepository.findAllOrderByLikesCountDesc(pageable);
    }
}