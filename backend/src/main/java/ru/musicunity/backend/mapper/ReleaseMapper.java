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
    private final UserMapper userMapper;

    public ReleaseMapper(GenreMapper genreMapper, UserMapper userMapper) {
        this.genreMapper = genreMapper;
        this.userMapper = userMapper;
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
        dto.setFavoritesCount(release.getFavoritesCount());
        dto.setAddedAt(release.getAddedAt());
        dto.setDeletedAt(release.getAddedAt());
        
        // Маппим авторов
        dto.setAuthors(release.getAuthors().stream()
                .map(author -> new ReleaseDTO.AuthorDTO(
                        author.getAuthor().getAuthorId(),
                        author.getAuthor().getAuthorName(),
                        author.getAuthor().getAvatarUrl(),
                        author.getIsArtist(),
                        author.getIsProducer(),
                        author.getAuthor().getBio(),
                        author.getAuthor().getIsVerified(),
                        author.getAuthor().getUser() != null ? userMapper.toDTO(author.getAuthor().getUser()) : null
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
                    
            double extendedAvg = 0.0;
            if (!extendedReviews.isEmpty()) {
                extendedAvg = extendedReviews.stream()
                        .mapToDouble(review -> review.getTotalScore())
                        .average()
                        .orElse(0.0);
                        
                dto.setFullReviewRating(extendedAvg);
                dto.setAverageExtendedRating(extendedAvg);
                
                // Устанавливаем количество полных рецензий
                dto.setExtendedReviewsCount(extendedReviews.size());
            } else {
                dto.setExtendedReviewsCount(0);
            }
            
            // Рейтинг по простым рецензиям (SIMPLE)
            List<Review> simpleReviews = reviews.stream()
                    .filter(review -> review.getType() == ReviewType.SIMPLE && review.getTotalScore() != null)
                    .collect(Collectors.toList());
                    
            double simpleAvg = 0.0;
            if (!simpleReviews.isEmpty()) {
                simpleAvg = simpleReviews.stream()
                        .mapToDouble(review -> review.getTotalScore())
                        .average()
                        .orElse(0.0);
                        
                dto.setSimpleReviewRating(simpleAvg);
                
                // Устанавливаем количество простых рецензий
                dto.setSimpleReviewsCount(simpleReviews.size());
            } else {
                dto.setSimpleReviewsCount(0);
            }
            
            // Общий средний рейтинг (все типы рецензий)
            List<Review> allRatedReviews = reviews.stream()
                    .filter(review -> review.getTotalScore() != null)
                    .collect(Collectors.toList());
                    
            if (!allRatedReviews.isEmpty()) {
                double overallAvg = allRatedReviews.stream()
                        .mapToDouble(review -> review.getTotalScore())
                        .average()
                        .orElse(0.0);
                        
                dto.setAverageRating(overallAvg);
                dto.setAvgRating(overallAvg);
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
        release.setFavoritesCount(dto.getFavoritesCount());
        release.setAddedAt(dto.getAddedAt());
        release.setIsDeleted(false);

        return release;
    }
} 