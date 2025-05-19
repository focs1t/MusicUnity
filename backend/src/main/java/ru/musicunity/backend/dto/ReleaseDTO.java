package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.ReleaseType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReleaseDTO {
    private Long releaseId;
    private String title;
    private ReleaseType type;
    private LocalDate releaseDate;
    private String coverUrl;
    private String releaseLink;
    private Integer favoritesCount;
    private LocalDateTime addedAt;
    private List<AuthorDTO> authors;
    private List<GenreDTO> genres;
    private Double averageRating;
    private Integer reviewsCount;
} 