package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.ReleaseAuthor;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.enums.ReviewType;

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

        // Вычисляем рейтинги и количество отзывов
        if (release.getReviews() != null && !release.getReviews().isEmpty()) {
            List<Review> reviews = release.getReviews().stream()
                    .filter(review -> !review.getIsDeleted())
                    .collect(Collectors.toList());
                    
            dto.setReviewsCount(reviews.size());
            
            // Считаем все рецензии как комментарии (в будущем можно добавить тип COMMENT)
            dto.setCommentCount(reviews.size());
            
            // Удаляем средний рейтинг, так как у нас есть отдельные рейтинги
            // dto.setAverageRating(...) - больше не используем
                    
            // Рейтинг по полным рецензиям (EXTENDED)
            List<Review> extendedReviews = reviews.stream()
                    .filter(review -> review.getType() == ReviewType.EXTENDED && review.getTotalScore() != null)
                    .collect(Collectors.toList());
                    
            if (!extendedReviews.isEmpty()) {
                dto.setFullReviewRating(extendedReviews.stream()
                        .mapToDouble(review -> review.getTotalScore())
                        .average()
                        .orElse(0.0));
                
                // Устанавливаем количество полных рецензий
                dto.setExtendedReviewsCount(extendedReviews.size());
            } else {
                dto.setExtendedReviewsCount(0);
            }
            
            // Рейтинг по простым рецензиям (SIMPLE)
            List<Review> simpleReviews = reviews.stream()
                    .filter(review -> review.getType() == ReviewType.SIMPLE && review.getTotalScore() != null)
                    .collect(Collectors.toList());
                    
            if (!simpleReviews.isEmpty()) {
                dto.setSimpleReviewRating(simpleReviews.stream()
                        .mapToDouble(review -> review.getTotalScore())
                        .average()
                        .orElse(0.0));
                
                // Устанавливаем количество простых рецензий
                dto.setSimpleReviewsCount(simpleReviews.size());
            } else {
                dto.setSimpleReviewsCount(0);
            }
        } else {
            dto.setReviewsCount(0);
            dto.setCommentCount(0);
            dto.setExtendedReviewsCount(0);
            dto.setSimpleReviewsCount(0);
            // Удаляем установку среднего рейтинга
            // dto.setAverageRating(0.0);
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
        release.setIsDeleted(false);

        return release;
    }
} 