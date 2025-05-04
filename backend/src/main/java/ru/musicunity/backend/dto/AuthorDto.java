package ru.musicunity.backend.dto;

import lombok.Data;

@Data
public class AuthorDto {
    private Long authorId;
    private String authorName;
    private Boolean isVerified;
    private String avatarUrl;
    private String bio;
    private Integer followingCount;
    private String role;
} 