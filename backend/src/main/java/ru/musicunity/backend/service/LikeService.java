package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.LikeDTO;
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.exception.AuthorCannotLikeOthersReviewsException;
import ru.musicunity.backend.exception.LikeExistsException;
import ru.musicunity.backend.exception.ReviewNotFoundException;
import ru.musicunity.backend.exception.UserNotFoundException;
import ru.musicunity.backend.mapper.LikeMapper;
import ru.musicunity.backend.mapper.ReviewMapper;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Like;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.LikeType;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.LikeRepository;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final LikeMapper likeMapper;
    private final ReviewMapper reviewMapper;

    public List<LikeDTO> getLikesByReview(Long reviewId) {
        return likeRepository.findAllByReviewId(reviewId)
                .stream()
                .map(likeMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<LikeDTO> getAuthorLikesByReview(Long reviewId) {
        return likeRepository.findAllByReviewIdAndType(reviewId, LikeType.AUTHOR)
                .stream()
                .map(likeMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public Page<ReviewDTO> getAllReviewsWithAuthorLikes(Pageable pageable) {
        try {
            Page<Review> reviews = likeRepository.findAllReviewsWithAuthorLikes(LikeType.AUTHOR, pageable);
            
            // Конвертируем в DTO
            Page<ReviewDTO> reviewDTOs = reviews.map(reviewMapper::toDTO);
            
            // Добавляем информацию об авторах лайков для каждой рецензии
            reviewDTOs.forEach(reviewDTO -> {
                List<LikeDTO> authorLikes = getAuthorLikesByReview(reviewDTO.getReviewId());
                if (!authorLikes.isEmpty()) {
                    // Берем первый авторский лайк (или можно обработать все)
                    LikeDTO authorLike = authorLikes.get(0);
                    
                    // Получаем информацию о пользователе (авторе), который поставил лайк
                    try {
                        User author = userRepository.findById(authorLike.getUserId())
                                .orElseThrow(() -> new UserNotFoundException(authorLike.getUserId()));
                        
                        ReviewDTO.UserDTO authorDTO = new ReviewDTO.UserDTO();
                        authorDTO.setUserId(author.getUserId());
                        authorDTO.setUsername(author.getUsername());
                        authorDTO.setAvatarUrl(author.getAvatarUrl());
                        
                        reviewDTO.setAuthorLike(authorDTO);
                    } catch (Exception e) {
                        System.err.println("Ошибка при получении информации об авторе лайка: " + e.getMessage());
                    }
                }
            });
            
            return reviewDTOs;
        } catch (Exception e) {
            // Логирование ошибки для отладки
            System.err.println("Ошибка при получении рецензий с авторскими лайками: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Long getLikesCountByReview(Long reviewId) {
        return likeRepository.countByReviewReviewId(reviewId);
    }

    public Long getReceivedLikesCountByUser(Long userId) {
        return likeRepository.countByReviewAuthorUserId(userId);
    }

    public Long getGivenLikesCountByUser(Long userId) {
        return likeRepository.countByUserUserId(userId);
    }

    public Long getReceivedAuthorLikesCountByUser(Long userId) {
        return likeRepository.countByReviewAuthorUserIdAndType(userId, LikeType.AUTHOR);
    }

    @Transactional
    public LikeDTO createLike(Long reviewId, Long userId, LikeType type) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (likeRepository.existsByReviewAndUser(review, user)) {
            throw new LikeExistsException();
        }

        // Проверяем, является ли пользователь автором
        Optional<Author> author = authorRepository.findByUserUserId(userId);
        if (author.isPresent()) {
            // Если это автор, проверяем, является ли он автором релиза, на который написана рецензия
            boolean isAuthorOfRelease = review.getRelease().getAuthors().stream()
                    .anyMatch(releaseAuthor -> releaseAuthor.getAuthor().getAuthorId().equals(author.get().getAuthorId()));
            
            if (!isAuthorOfRelease) {
                throw new AuthorCannotLikeOthersReviewsException();
            }
            // Автор может лайкать только авторским лайком
            type = LikeType.AUTHOR;
        }

        Like like = Like.builder()
                .review(review)
                .user(user)
                .type(type)
                .build();
        return likeMapper.toDTO(likeRepository.save(like));
    }

    @Transactional
    public void removeLike(Long reviewId, Long userId) {
        likeRepository.deleteByReviewReviewIdAndUserUserId(reviewId, userId);
    }
}
