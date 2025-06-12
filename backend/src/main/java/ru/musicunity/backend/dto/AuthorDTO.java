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
    private LocalDateTime deletedAt;
    private Double averageAlbumExtendedRating;
    private Double averageAlbumSimpleRating;
    private Double averageSingleEpExtendedRating;
    private Double averageSingleEpSimpleRating;
} 