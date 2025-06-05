package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.exception.ReviewNotFoundException;
import ru.musicunity.backend.mapper.ReviewMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReviewType;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.repository.UserRepository;
import ru.musicunity.backend.exception.UserNotFoundException;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final ReleaseService releaseService;
    private final ReviewMapper reviewMapper;
    private final UserMapper userMapper;
    private final UserRepository userRepository;

    public ReviewDTO getReviewById(Long id) {
        return reviewRepository.findById(id)
                .map(reviewMapper::toDTO)
                .orElseThrow(() -> new ReviewNotFoundException(id));
    }

    private void checkIfUserIsAuthor(Release release, User user) {
        boolean isAuthor = release.getAuthors().stream()
                .anyMatch(releaseAuthor -> releaseAuthor.getAuthor().getUser() != null &&
                        releaseAuthor.getAuthor().getUser().getUserId().equals(user.getUserId()));
        if (isAuthor) {
            throw new RuntimeException("Автор не может оставлять рецензию на собственный релиз");
        }
    }

    @Transactional
    public ReviewDTO createFullReview(Long userId, Long releaseId, String title, String content,
                                   Integer rhymeImagery, Integer structureRhythm, Integer styleExecution,
                                   Integer individuality, Integer vibe) {
        User user = userMapper.toEntity(userService.getUserById(userId));
        Release release = releaseService.getReleaseEntityById(releaseId);

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

        return reviewMapper.toDTO(reviewRepository.save(review));
    }

    @Transactional
    public ReviewDTO createSimpleReview(Long userId, Long releaseId,
                                      Integer rhymeImagery, Integer structureRhythm, 
                                      Integer styleExecution, Integer individuality, Integer vibe) {
        User user = userMapper.toEntity(userService.getUserById(userId));
        Release release = releaseService.getReleaseEntityById(releaseId);

        checkIfUserIsAuthor(release, user);

        Review review = Review.builder()
                .user(user)
                .release(release)
                .type(ReviewType.SIMPLE)
                .rhymeImagery(rhymeImagery)
                .structureRhythm(structureRhythm)
                .styleExecution(styleExecution)
                .individuality(individuality)
                .vibe(vibe)
                .likesCount(0)
                .build();

        return reviewMapper.toDTO(reviewRepository.save(review));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void softDeleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));
        review.setIsDeleted(true);
        reviewRepository.save(review);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void hardDeleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));
        reviewRepository.delete(review);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void restoreReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));
        review.setIsDeleted(false);
        reviewRepository.save(review);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Page<ReviewDTO> getAllDeletedReviews(Pageable pageable) {
        return reviewRepository.findAllDeleted(pageable)
                .map(reviewMapper::toDTO);
    }

    public Page<ReviewDTO> getAllByRelease(Long releaseId, Pageable pageable) {
        return reviewRepository.findAllByReleaseReleaseIdAndIsDeletedFalse(releaseId, pageable)
                .map(reviewMapper::toDTO);
    }

    public Page<ReviewDTO> getAllByUser(Long userId, Pageable pageable) {
        return reviewRepository.findAllByUserUserIdAndIsDeletedFalse(userId, pageable)
                .map(reviewMapper::toDTO);
    }

    public Page<ReviewDTO> getAllSorted(Pageable pageable) {
        return reviewRepository.findAllSorted(pageable)
                .map(reviewMapper::toDTO);
    }

    public long getReviewsCountByUser(Long userId) {
        return reviewRepository.countByUser(userId);
    }

    public long getReviewsCountByRelease(Long releaseId) {
        return reviewRepository.countByRelease(releaseId);
    }

    /**
     * Получение списка рецензий, которые лайкнул пользователь
     * @param userId ID пользователя
     * @param pageable параметры пагинации
     * @return страница DTO рецензий
     */
    public Page<ReviewDTO> getLikedReviewsByUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
                
        // Получаем ID рецензий, которые лайкнул пользователь
        Page<Review> likedReviews = reviewRepository.findLikedByUser(userId, pageable);
        return likedReviews.map(reviewMapper::toDTO);
    }
}