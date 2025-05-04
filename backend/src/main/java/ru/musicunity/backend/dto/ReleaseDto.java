package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.Release;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReleaseDto {
    private Long releaseId;
    private String title;
    private String description;
    private String coverUrl;
    private String releaseLink;
    private LocalDate releaseDate;
    private LocalDateTime addedAt;
    private Integer favoritesCount;
    private Release.ReleaseType type;
    private List<AuthorDto> authors;
    private List<GenreDto> genres;

    public static ReleaseDto fromRelease(Release release) {
        ReleaseDto dto = new ReleaseDto();
        dto.setReleaseId(release.getReleaseId());
        dto.setTitle(release.getTitle());
        dto.setDescription(release.getDescription());
        dto.setCoverUrl(release.getCoverUrl());
        dto.setReleaseLink(release.getReleaseLink());
        dto.setReleaseDate(release.getReleaseDate());
        dto.setAddedAt(release.getAddedAt());
        dto.setFavoritesCount(release.getFavoritesCount());
        dto.setType(release.getType());
        dto.setAuthors(release.getAuthors().stream()
                .map(AuthorDto::fromAuthor)
                .toList());
        dto.setGenres(release.getGenres().stream()
                .map(GenreDto::fromGenre)
                .toList());
        return dto;
    }
} 