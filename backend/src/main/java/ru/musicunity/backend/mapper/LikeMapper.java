package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.LikeDTO;
import ru.musicunity.backend.pojo.Like;

@Component
public class LikeMapper {
    
    public LikeDTO toDTO(Like like) {
        if (like == null) {
            return null;
        }
        
        LikeDTO dto = new LikeDTO();
        dto.setLikeId(like.getLikeId());
        dto.setReviewId(like.getReview().getReviewId());
        dto.setUserId(like.getUser().getUserId());
        dto.setType(like.getType());
        
        return dto;
    }
    
    public Like toEntity(LikeDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Like like = new Like();
        like.setLikeId(dto.getLikeId());
        like.setType(dto.getType());
        
        return like;
    }
} 