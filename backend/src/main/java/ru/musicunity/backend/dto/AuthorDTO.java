package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.AuthorRole;

import java.time.LocalDateTime;

@Data
public class AuthorDTO {
    private Long authorId;
    private String authorName;
    private Boolean isVerified;
    private Long userId;
    private String avatarUrl;
    private String bio;
    private LocalDateTime createdAt;
    private Integer followingCount;
    private AuthorRole role;
} 