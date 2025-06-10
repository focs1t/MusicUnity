package ru.musicunity.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "DTO для обновления данных автора")
public class AuthorUpdateDTO {
    
    @Schema(description = "Биография автора", example = "Текст биографии автора")
    private String bio;
    
    @Schema(description = "URL аватара автора", example = "https://example.com/avatar.jpg")
    private String avatarUrl;
} 