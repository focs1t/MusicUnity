package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.pojo.Review;

@Component
public class ReviewMapper {
    
    public ReviewDTO toDTO(Review review) {
        if (review == null) {
            return null;
        }
        
        ReviewDTO dto = new ReviewDTO();
        dto.setReviewId(review.getReviewId());
        dto.setUserId(review.getUser().getUserId());
        dto.setReleaseId(review.getRelease().getReleaseId());
        dto.setType(review.getType());
        dto.setTitle(review.getTitle());
        dto.setContent(review.getContent());
        dto.setRhymeImagery(review.getRhymeImagery());
        dto.setStructureRhythm(review.getStructureRhythm());
        dto.setStyleExecution(review.getStyleExecution());
        dto.setIndividuality(review.getIndividuality());
        dto.setVibe(review.getVibe());
        dto.setLikesCount(review.getLikesCount());
        
        // Явно устанавливаем значение totalScore из entity
        Integer totalScore = review.getTotalScore();
        dto.setTotalScore(totalScore != null ? totalScore : 
            // Если значение null, вычисляем по формуле
            Math.round((review.getRhymeImagery() + review.getStructureRhythm() + 
                      review.getStyleExecution() + review.getIndividuality()) * 
                      (1 + (review.getVibe() / 10.0f) * 1.5f)));
            
        dto.setCreatedAt(review.getCreatedAt());
        
        // Заполняем данные пользователя
        if (review.getUser() != null) {
            ReviewDTO.UserDTO userDTO = new ReviewDTO.UserDTO();
            userDTO.setUserId(review.getUser().getUserId());
            userDTO.setUsername(review.getUser().getUsername());
            userDTO.setAvatarUrl(review.getUser().getAvatarUrl());
            // Ранг можно установить позже через UserService если потребуется
            dto.setUser(userDTO);
        }
        
        // Заполняем данные релиза
        if (review.getRelease() != null) {
            ReviewDTO.ReleaseDTO releaseDTO = new ReviewDTO.ReleaseDTO();
            releaseDTO.setReleaseId(review.getRelease().getReleaseId());
            releaseDTO.setTitle(review.getRelease().getTitle());
            releaseDTO.setCoverUrl(review.getRelease().getCoverUrl());
            dto.setRelease(releaseDTO);
        }
        
        return dto;
    }
    
    public Review toEntity(ReviewDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Review review = new Review();
        review.setReviewId(dto.getReviewId());
        review.setType(dto.getType());
        review.setTitle(dto.getTitle());
        review.setContent(dto.getContent());
        review.setRhymeImagery(dto.getRhymeImagery());
        review.setStructureRhythm(dto.getStructureRhythm());
        review.setStyleExecution(dto.getStyleExecution());
        review.setIndividuality(dto.getIndividuality());
        review.setVibe(dto.getVibe());
        review.setLikesCount(dto.getLikesCount());
        review.setCreatedAt(dto.getCreatedAt());
        review.setIsDeleted(false);
        
        return review;
    }
} 