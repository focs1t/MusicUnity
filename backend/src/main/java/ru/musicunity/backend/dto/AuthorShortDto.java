package ru.musicunity.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorShortDto {
    private Long authorId;
    private String authorName;
    private String avatarUrl;
    private boolean isVerified;
} 