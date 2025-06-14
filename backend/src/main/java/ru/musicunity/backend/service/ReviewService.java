package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.AverageRatingsDTO;
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.exception.ReviewNotFoundException;
import ru.musicunity.backend.exception.UserNotFoundException;
import ru.musicunity.backend.mapper.ReviewMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReviewType;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.repository.UserRepository;
import ru.musicunity.backend.repository.LikeRepository;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final ReleaseService releaseService;
    private final ReviewMapper reviewMapper;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    public ReviewDTO getReviewById(Long id) {
        return reviewRepository.findById(id)
                .map(reviewMapper::toDTO)
                .orElseThrow(() -> new ReviewNotFoundException(id));
    }

    public ReviewDTO getReviewByIdWithAccessControl(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException(id));
        
        // Если рецензия удалена, проверяем права доступа
        if (review.getIsDeleted()) {
            // Проверяем, является ли текущий пользователь админом
            boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                    .getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role -> role.equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                throw new ReviewNotFoundException(id);
            }
        }
        
        return reviewMapper.toDTO(review);
    }

    /**
     * Получение рецензии в виде Entity по ID (для внутреннего использования)
     * @param id ID рецензии
     * @return объект Review
     */
    public Review getReviewEntityById(Long id) {
        return reviewRepository.findById(id)
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
                .isDeleted(false)
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
                .isDeleted(false)
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
        
        // Каскадное удаление: удаляем все лайки рецензии
        likeRepository.findAllByReviewId(reviewId).forEach(like -> {
            likeRepository.delete(like);
        });
        
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

    public Page<ReviewDTO> getAllExtendedByRelease(Long releaseId, Pageable pageable) {
        return reviewRepository.findAllByReleaseReleaseIdAndTypeAndIsDeletedFalse(releaseId, ReviewType.EXTENDED, pageable)
                .map(reviewMapper::toDTO);
    }

    public Page<ReviewDTO> getAllByUser(Long userId, Pageable pageable) {
        return reviewRepository.findAllByUserUserIdAndIsDeletedFalse(userId, pageable)
                .map(reviewMapper::toDTO);
    }

    /**
     * Получение рецензий определенного типа по релизу
     * @param releaseId ID релиза
     * @param type тип рецензии
     * @param pageable параметры пагинации
     * @return страница рецензий
     */
    public Page<ReviewDTO> getReviewsByReleaseAndType(Long releaseId, ReviewType type, Pageable pageable) {
        return reviewRepository.findAllByReleaseReleaseIdAndTypeAndIsDeletedFalse(releaseId, type, pageable)
                .map(reviewMapper::toDTO);
    }
    
    /**
     * Получение рецензий определенного типа, созданных пользователем
     * @param userId ID пользователя
     * @param type тип рецензии
     * @param pageable параметры пагинации
     * @return страница рецензий
     */
    public Page<ReviewDTO> getReviewsByUserAndType(Long userId, ReviewType type, Pageable pageable) {
        return reviewRepository.findAllByUserUserIdAndTypeAndIsDeletedFalse(userId, type, pageable)
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
     * Получение количества рецензий определенного типа по релизу
     * @param releaseId ID релиза
     * @param type тип рецензии
     * @return количество рецензий
     */
    public long getReviewsCountByReleaseAndType(Long releaseId, ReviewType type) {
        return reviewRepository.countByReleaseAndType(releaseId, type);
    }
    
    /**
     * Получение количества рецензий определенного типа, созданных пользователем
     * @param userId ID пользователя
     * @param type тип рецензии
     * @return количество рецензий
     */
    public long getReviewsCountByUserAndType(Long userId, ReviewType type) {
        return reviewRepository.countByUserAndType(userId, type);
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
    
    /**
     * Получение средних оценок по параметрам для релиза
     * @param releaseId ID релиза
     * @return DTO со средними оценками
     */
    public AverageRatingsDTO getAverageRatingsByRelease(Long releaseId) {
        // Получаем средние оценки для расширенных рецензий
        AverageRatingsDTO.RatingDetails extendedRatings = AverageRatingsDTO.RatingDetails.builder()
                .rhymeImagery(reviewRepository.getAverageRhymeImageryByReleaseAndTypeExtended(releaseId))
                .structureRhythm(reviewRepository.getAverageStructureRhythmByReleaseAndTypeExtended(releaseId))
                .styleExecution(reviewRepository.getAverageStyleExecutionByReleaseAndTypeExtended(releaseId))
                .individuality(reviewRepository.getAverageIndividualityByReleaseAndTypeExtended(releaseId))
                .vibe(reviewRepository.getAverageVibeByReleaseAndTypeExtended(releaseId))
                .build();
        
        // Получаем средние оценки для простых рецензий
        AverageRatingsDTO.RatingDetails simpleRatings = AverageRatingsDTO.RatingDetails.builder()
                .rhymeImagery(reviewRepository.getAverageRhymeImageryByReleaseAndTypeSimple(releaseId))
                .structureRhythm(reviewRepository.getAverageStructureRhythmByReleaseAndTypeSimple(releaseId))
                .styleExecution(reviewRepository.getAverageStyleExecutionByReleaseAndTypeSimple(releaseId))
                .individuality(reviewRepository.getAverageIndividualityByReleaseAndTypeSimple(releaseId))
                .vibe(reviewRepository.getAverageVibeByReleaseAndTypeSimple(releaseId))
                .build();
        
        return AverageRatingsDTO.builder()
                .extended(extendedRatings)
                .simple(simpleRatings)
                .build();
    }
}