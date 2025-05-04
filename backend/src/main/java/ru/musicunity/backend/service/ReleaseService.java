package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.dto.*;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Genre;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.GenreRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.exception.AuthorNotFoundException;
import ru.musicunity.backend.exception.ReleaseNotFoundException;
import ru.musicunity.backend.exception.GenreNotFoundException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReleaseService {
    private final ReleaseRepository releaseRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final ReviewRepository reviewRepository;

    // Добавить релиз с авторами и жанрами
    public void addReleaseWithAuthorsAndGenres(ReleaseDto dto, List<Long> authorIds, List<Long> genreIds) {
        List<Author> authors = authorRepository.findAllById(authorIds);
        if (authors.size() != authorIds.size()) {
            throw new AuthorNotFoundException(authorIds.stream()
                    .filter(id -> authors.stream().noneMatch(a -> a.getAuthorId().equals(id)))
                    .findFirst()
                    .orElseThrow());
        }

        List<Genre> genres = genreRepository.findAllById(genreIds);
        if (genres.size() != genreIds.size()) {
            throw new GenreNotFoundException(genreIds.stream()
                    .filter(id -> genres.stream().noneMatch(g -> g.getGenreId().equals(id)))
                    .findFirst()
                    .orElseThrow());
        }

        Release release = Release.builder()
                .title(dto.getTitle())
                .type(Release.ReleaseType.valueOf(dto.getType()))
                .releaseDate(dto.getReleaseDate())
                .coverUrl(dto.getCoverUrl())
                .releaseLink(dto.getReleaseLink())
                .favoritesCount(0)
                .authors(authors)
                .genres(genres)
                .build();
        releaseRepository.save(release);
    }

    // Добавить свой релиз (для автора)
    public void addOwnRelease(ReleaseDto dto, Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        
        List<Genre> genres = genreRepository.findAllById(dto.getGenreIds());
        if (genres.size() != dto.getGenreIds().size()) {
            throw new GenreNotFoundException(dto.getGenreIds().stream()
                    .filter(id -> genres.stream().noneMatch(g -> g.getGenreId().equals(id)))
                    .findFirst()
                    .orElseThrow());
        }

        Release release = Release.builder()
                .title(dto.getTitle())
                .type(Release.ReleaseType.valueOf(dto.getType()))
                .releaseDate(dto.getReleaseDate())
                .coverUrl(dto.getCoverUrl())
                .releaseLink(dto.getReleaseLink())
                .favoritesCount(0)
                .authors(List.of(author))
                .genres(genres)
                .build();
        releaseRepository.save(release);
    }

    // Список релизов по дате (новые)
    public List<ReleaseDto> getNewest(int page, int size) {
        return releaseRepository.findAll(PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Поиск по автору
    public List<ReleaseDto> getByAuthor(Long authorId, int page, int size) {
        return releaseRepository.findByAuthor(authorId, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Группировка релизов по типу для автора
    public Map<String, List<ReleaseDto>> getByAuthorGroupedByType(Long authorId, int page, int size) {
        List<Release> releases = releaseRepository.findByAuthor(authorId, PageRequest.of(page, size)).getContent();
        return releases.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getType().name(),
                        Collectors.mapping(this::toDto, Collectors.toList())
                ));
    }

    // Топ 5 релизов по автору (по количеству лайков/оценок)
    public List<ReleaseDto> getTop5ByAuthor(Long authorId) {
        return releaseRepository.findTop5ByAuthorOrderByTotalScoreDesc(authorId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Топ 5 релизов по средней оценке (только полные рецензии)
    public List<ReleaseDto> getTop5ByAuthorByScore(Long authorId) {
        List<Release> releases = releaseRepository.findByAuthor(authorId, PageRequest.of(0, 100)).getContent();
        return releases.stream()
                .sorted((r1, r2) -> Double.compare(getAvgExtendedScore(r2), getAvgExtendedScore(r1)))
                .limit(5)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private double getAvgExtendedScore(Release release) {
        List<Review> reviews = reviewRepository.findAll().stream()
                .filter(r -> r.getRelease().getReleaseId().equals(release.getReleaseId()))
                .filter(r -> r.getType() == Review.ReviewType.EXTENDED)
                .collect(Collectors.toList());
        if (reviews.isEmpty()) return 0.0;
        return reviews.stream().mapToInt(Review::getTotalScore).average().orElse(0.0);
    }

    // Топ 15 релизов по количеству рецензий и оценок за сутки
    public List<ReleaseDto> getTop15ByReviewsToday() {
        LocalDateTime since = LocalDate.now().atStartOfDay();
        Map<Release, Long> releaseToReviewCount = reviewRepository.findAll().stream()
                .filter(r -> r.getCreatedAt().isAfter(since))
                .collect(Collectors.groupingBy(Review::getRelease, Collectors.counting()));
        return releaseToReviewCount.entrySet().stream()
                .sorted(Map.Entry.<Release, Long>comparingByValue().reversed())
                .limit(15)
                .map(e -> toDto(e.getKey()))
                .collect(Collectors.toList());
    }

    // Полная инфа о релизе (с авторами и жанрами)
    public ReleaseDto getRelease(Long id) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new ReleaseNotFoundException(id));
        ReleaseDto dto = toDto(release);
        dto.setAuthorIds(release.getAuthors().stream().map(Author::getAuthorId).collect(Collectors.toList()));
        dto.setGenreIds(release.getGenres().stream().map(Genre::getGenreId).collect(Collectors.toList()));
        return dto;
    }

    private ReleaseDto toDto(Release release) {
        ReleaseDto dto = new ReleaseDto();
        dto.setReleaseId(release.getReleaseId());
        dto.setTitle(release.getTitle());
        dto.setType(release.getType().name());
        dto.setReleaseDate(release.getReleaseDate());
        dto.setCoverUrl(release.getCoverUrl());
        dto.setReleaseLink(release.getReleaseLink());
        dto.setFavoritesCount(release.getFavoritesCount());
        return dto;
    }

    public List<ReleaseShortDto> searchReleases(String query, int page, int size) {
        return releaseRepository.searchReleases(query, PageRequest.of(page, size))
                .stream()
                .map(this::toShortDto)
                .collect(Collectors.toList());
    }

    private ReleaseShortDto toShortDto(Release release) {
        ReleaseShortDto dto = new ReleaseShortDto();
        dto.setReleaseId(release.getReleaseId());
        dto.setTitle(release.getTitle());
        dto.setType(release.getType().name());
        dto.setReleaseDate(release.getReleaseDate());
        dto.setCoverUrl(release.getCoverUrl());
        dto.setFavoritesCount(release.getFavoritesCount());
        return dto;
    }
}