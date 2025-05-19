package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.pojo.Author;

@Component
public class AuthorMapper {
    
    public AuthorDTO toDTO(Author author) {
        if (author == null) {
            return null;
        }
        
        AuthorDTO dto = new AuthorDTO();
        dto.setAuthorId(author.getAuthorId());
        dto.setAuthorName(author.getAuthorName());
        dto.setIsVerified(author.getIsVerified());
        dto.setUserId(author.getUser() != null ? author.getUser().getUserId() : null);
        dto.setAvatarUrl(author.getAvatarUrl());
        dto.setBio(author.getBio());
        dto.setCreatedAt(author.getCreatedAt());
        dto.setFollowingCount(author.getFollowingCount());
        dto.setRole(author.getRole());
        
        return dto;
    }
    
    public Author toEntity(AuthorDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Author author = new Author();
        author.setAuthorId(dto.getAuthorId());
        author.setAuthorName(dto.getAuthorName());
        author.setIsVerified(dto.getIsVerified());
        author.setAvatarUrl(dto.getAvatarUrl());
        author.setBio(dto.getBio());
        author.setCreatedAt(dto.getCreatedAt());
        author.setFollowingCount(dto.getFollowingCount());
        author.setRole(dto.getRole());
        
        return author;
    }
} 