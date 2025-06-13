package ru.musicunity.backend.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.LikeDTO;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Like;
import ru.musicunity.backend.pojo.enums.LikeType;
import ru.musicunity.backend.repository.AuthorRepository;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LikeMapper {
    
    private final AuthorRepository authorRepository;
    
    public LikeDTO toDTO(Like like) {
        if (like == null) {
            return null;
        }
        
        LikeDTO dto = new LikeDTO();
        dto.setLikeId(like.getLikeId());
        dto.setReviewId(like.getReview().getReviewId());
        dto.setUserId(like.getUser().getUserId());
        dto.setType(like.getType());
        
        // Добавляем информацию об авторе лайка
        if (like.getUser() != null) {
            LikeDTO.AuthorInfo authorInfo = new LikeDTO.AuthorInfo();
            
            // Если это авторский лайк, берем данные из Author
            if (like.getType() == LikeType.AUTHOR) {
                Optional<Author> author = authorRepository.findByUserUserId(like.getUser().getUserId());
                if (author.isPresent()) {
                    Author authorEntity = author.get();
                    authorInfo.setUserId(authorEntity.getUser().getUserId());
                    authorInfo.setName(authorEntity.getAuthorName());
                    authorInfo.setUsername(authorEntity.getAuthorName());
                    authorInfo.setAvatar(authorEntity.getAvatarUrl());
                } else {
                    // Fallback на пользователя если автор не найден
                    authorInfo.setUserId(like.getUser().getUserId());
                    authorInfo.setName(like.getUser().getUsername());
                    authorInfo.setUsername(like.getUser().getUsername());
                    authorInfo.setAvatar(like.getUser().getAvatarUrl());
                }
            } else {
                // Для обычных лайков берем данные из User
                authorInfo.setUserId(like.getUser().getUserId());
                authorInfo.setName(like.getUser().getUsername());
                authorInfo.setUsername(like.getUser().getUsername());
                authorInfo.setAvatar(like.getUser().getAvatarUrl());
            }
            
            dto.setAuthor(authorInfo);
        }
        
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