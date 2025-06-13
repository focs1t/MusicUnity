package ru.musicunity.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRatingDTO {
    private Long id;
    private String username;
    private String avatarUrl;
    private Integer points;
    private Integer authorLikes;
    private Integer reviews;
    private Integer likesGiven;
    private Integer likesReceived;
} 