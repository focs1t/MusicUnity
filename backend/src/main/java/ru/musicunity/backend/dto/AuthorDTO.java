package ru.musicunity.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuthorDTO {
    private Long authorId;
    private String authorName;
    private Boolean isVerified;
    private Long userId;
    private String avatarUrl;
    private String bio;
    private Boolean isArtist;
    private Boolean isProducer;
    private Integer followingCount;
    private LocalDateTime createdAt;
} 