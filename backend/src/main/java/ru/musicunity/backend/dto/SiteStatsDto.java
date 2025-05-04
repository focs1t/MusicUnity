package ru.musicunity.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteStatsDto {
    private long totalUsers;
    private long totalAuthors;
    private long totalReleases;
    private long totalReviews;
    private long totalLikes;
} 