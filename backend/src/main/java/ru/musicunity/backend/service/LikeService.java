package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.LikeDto;
import ru.musicunity.backend.pojo.Like;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.repository.LikeRepository;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public Long countByReview(Long reviewId) {
        return likeRepository.countByReview(reviewId);
    }

    public Long countByUser(Long userId) {
        return likeRepository.countByUser(userId);
    }

    public List<LikeDto> getLikesByUser(Long userId) {
        return likeRepository.findByUser(userId).stream().map(this::toDto).toList();
    }

    @Transactional
    public void addLike(LikeDto dto) {
        Review review = reviewRepository.findById(dto.getReviewId()).orElseThrow();
        User user = userRepository.findById(dto.getUserId()).orElseThrow();
        if (likeRepository.findByReviewAndUser(review.getReviewId(), user.getUserId()) != null)
            throw new RuntimeException("Already liked");
        Like like = Like.builder()
                .review(review)
                .user(user)
                .type(Like.LikeType.valueOf(dto.getType()))
                .build();
        likeRepository.save(like);
        review.setLikesCount(review.getLikesCount() + 1);
        reviewRepository.save(review);
    }

    @Transactional
    public void removeLike(Long reviewId, Long userId) {
        Like like = likeRepository.findByReviewAndUser(reviewId, userId);
        if (like != null) {
            likeRepository.delete(like);
            Review review = like.getReview();
            review.setLikesCount(Math.max(0, review.getLikesCount() - 1));
            reviewRepository.save(review);
        }
    }

    private LikeDto toDto(Like like) {
        LikeDto dto = new LikeDto();
        dto.setLikeId(like.getLikeId());
        dto.setReviewId(like.getReview().getReviewId());
        dto.setUserId(like.getUser().getUserId());
        dto.setType(like.getType().name());
        return dto;
    }
}
