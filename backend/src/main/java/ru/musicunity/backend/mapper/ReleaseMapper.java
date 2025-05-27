package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.ReleaseAuthor;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReleaseMapper {
    private final GenreMapper genreMapper;

    public ReleaseMapper(GenreMapper genreMapper) {
        this.genreMapper = genreMapper;
    }

    public ReleaseDTO toDTO(Release release) {
        if (release == null) {
            return null;
        }

        ReleaseDTO dto = new ReleaseDTO();
        dto.setReleaseId(release.getReleaseId());
        dto.setTitle(release.getTitle());
        dto.setType(release.getType());
        dto.setReleaseDate(release.getReleaseDate());
        dto.setCoverUrl(release.getCoverUrl());
        dto.setReleaseLink(release.getReleaseLink());
        dto.setFavoritesCount(release.getFavoritesCount());
        dto.setAddedAt(release.getAddedAt());
        
        // Маппим авторов
        dto.setAuthors(release.getAuthors().stream()
                .map(author -> new ReleaseDTO.AuthorDTO(
                        author.getAuthor().getAuthorId(),
                        author.getAuthor().getAuthorName(),
                        author.getAuthor().getAvatarUrl(),
                        author.getIsArtist(),
                        author.getIsProducer()
                ))
                .collect(Collectors.toList()));

        // Маппим жанры
        dto.setGenres(release.getGenres().stream()
                .map(genreMapper::toDTO)
                .collect(Collectors.toList()));

        // Вычисляем средний рейтинг и количество отзывов
        if (release.getReviews() != null && !release.getReviews().isEmpty()) {
            dto.setReviewsCount(release.getReviews().size());
            dto.setAverageRating(release.getReviews().stream()
                    .mapToDouble(review -> review.getTotalScore())
                    .average()
                    .orElse(0.0));
        } else {
            dto.setReviewsCount(0);
            dto.setAverageRating(0.0);
        }

        return dto;
    }

    public Release toEntity(ReleaseDTO dto) {
        if (dto == null) {
            return null;
        }

        Release release = new Release();
        release.setReleaseId(dto.getReleaseId());
        release.setTitle(dto.getTitle());
        release.setType(dto.getType());
        release.setReleaseDate(dto.getReleaseDate());
        release.setCoverUrl(dto.getCoverUrl());
        release.setReleaseLink(dto.getReleaseLink());
        release.setFavoritesCount(dto.getFavoritesCount());
        release.setAddedAt(dto.getAddedAt());

        return release;
    }
} 