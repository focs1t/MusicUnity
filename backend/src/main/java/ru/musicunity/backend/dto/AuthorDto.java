package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.Author;

import java.time.LocalDateTime;

@Data
public class AuthorDto {
    private Long authorId;
    private String authorName;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private Integer followingCount;
    private Boolean isVerified;
    private Author.AuthorRole role;

    public static AuthorDto fromAuthor(Author author) {
        AuthorDto dto = new AuthorDto();
        dto.setAuthorId(author.getAuthorId());
        dto.setAuthorName(author.getAuthorName());
        dto.setAvatarUrl(author.getAvatarUrl());
        dto.setCreatedAt(author.getCreatedAt());
        dto.setFollowingCount(author.getFollowingCount());
        dto.setIsVerified(author.getIsVerified());
        dto.setRole(author.getRole());
        return dto;
    }
} 