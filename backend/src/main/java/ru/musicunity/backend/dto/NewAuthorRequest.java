package ru.musicunity.backend.dto;

import lombok.Data;

@Data
public class NewAuthorRequest {
    private String authorName;
    private String bio;
    private String avatarUrl;
} 