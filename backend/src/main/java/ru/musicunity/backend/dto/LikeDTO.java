package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.LikeType;

@Data
public class LikeDTO {
    private Long likeId;
    private Long reviewId;
    private Long userId;
    private LikeType type;
    
    // Информация об авторе лайка
    private AuthorInfo author;
    
    @Data
    public static class AuthorInfo {
        private Long userId;
        private String name;
        private String username;
        private String avatar;
    }
} 