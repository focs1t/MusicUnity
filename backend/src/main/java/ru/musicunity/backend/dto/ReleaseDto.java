package ru.musicunity.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ReleaseDto {
    private Long releaseId;
    private String title;
    private String type;
    private LocalDate releaseDate;
    private String coverUrl;
    private String releaseLink;
    private Integer favoritesCount;
    private List<Long> authorIds;
    private List<Long> genreIds;
} 