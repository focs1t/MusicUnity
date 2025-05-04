package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.NewAuthorRequest;
import ru.musicunity.backend.dto.ReleaseRequest;
import ru.musicunity.backend.dto.ReleaseDto;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.ReleaseAuthor;
import ru.musicunity.backend.pojo.ReleaseGenre;
import ru.musicunity.backend.pojo.Genre;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.ReleaseAuthorRepository;
import ru.musicunity.backend.repository.ReleaseGenreRepository;
import ru.musicunity.backend.repository.GenreRepository;
import ru.musicunity.backend.exception.ReleaseNotFoundException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReleaseService {
    private final ReleaseRepository releaseRepository;
    private final AuthorRepository authorRepository;
    private final ReleaseAuthorRepository releaseAuthorRepository;
    private final ReleaseGenreRepository releaseGenreRepository;
    private final GenreRepository genreRepository;

    @Transactional
    public ReleaseDto createRelease(ReleaseRequest request) {
        // Создаем новых авторов, если они указаны
        if (request.getNewAuthors() != null && !request.getNewAuthors().isEmpty()) {
            for (NewAuthorRequest newAuthor : request.getNewAuthors()) {
                Author author = Author.builder()
                        .authorName(newAuthor.getAuthorName())
                        .bio(newAuthor.getBio())
                        .avatarUrl(newAuthor.getAvatarUrl())
                        .isVerified(false)
                        .role(Author.AuthorRole.ARTIST)
                        .followingCount(0)
                        .build();
                Author savedAuthor = authorRepository.save(author);
                request.getAuthorIds().add(savedAuthor.getAuthorId());
            }
        }

        Release release = Release.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .coverUrl(request.getCoverUrl())
                .type(request.getType())
                .releaseDate(LocalDate.of(request.getYear(), 1, 1))
                .favoritesCount(0)
                .build();

        Release savedRelease = releaseRepository.save(release);

        // Добавляем связи с авторами
        request.getAuthorIds().forEach(authorId -> {
            ReleaseAuthor.ReleaseAuthorId id = new ReleaseAuthor.ReleaseAuthorId(savedRelease.getReleaseId(), authorId);
            ReleaseAuthor releaseAuthor = ReleaseAuthor.builder()
                    .id(id)
                    .release(savedRelease)
                    .author(authorRepository.findById(authorId).orElseThrow())
                    .build();
            releaseAuthorRepository.save(releaseAuthor);
        });

        // Добавляем связи с жанрами
        request.getGenreIds().forEach(genreId -> {
            ReleaseGenre.ReleaseGenreId id = new ReleaseGenre.ReleaseGenreId(savedRelease.getReleaseId(), genreId);
            ReleaseGenre releaseGenre = ReleaseGenre.builder()
                    .id(id)
                    .release(savedRelease)
                    .genre(genreRepository.findById(genreId).orElseThrow())
                    .build();
            releaseGenreRepository.save(releaseGenre);
        });

        return ReleaseDto.fromRelease(savedRelease);
    }

    @Transactional(readOnly = true)
    public ReleaseDto getRelease(Long releaseId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ReleaseNotFoundException(releaseId));
        return ReleaseDto.fromRelease(release);
    }

    @Transactional(readOnly = true)
    public List<ReleaseDto> getAllReleases() {
        return releaseRepository.findAll().stream()
                .map(ReleaseDto::fromRelease)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ReleaseDto> getAllReleases(int page, int size) {
        return releaseRepository.findAll(PageRequest.of(page, size))
                .map(ReleaseDto::fromRelease);
    }

    @Transactional(readOnly = true)
    public Page<ReleaseDto> searchReleases(String query, int page, int size) {
        return releaseRepository.searchReleases(query, PageRequest.of(page, size))
                .map(ReleaseDto::fromRelease);
    }

    @Transactional(readOnly = true)
    public Page<ReleaseDto> getReleasesByAuthor(Long authorId, int page, int size) {
        return releaseRepository.findByAuthor(authorId, PageRequest.of(page, size))
                .map(ReleaseDto::fromRelease);
    }

    @Transactional(readOnly = true)
    public Page<ReleaseDto> getReleasesByGenre(Long genreId, int page, int size) {
        return releaseRepository.findByGenre(genreId, PageRequest.of(page, size))
                .map(ReleaseDto::fromRelease);
    }

    @Transactional(readOnly = true)
    public Page<ReleaseDto> getTopReleases(int page, int size) {
        return releaseRepository.findTop15ByFavorites(PageRequest.of(page, size))
                .map(ReleaseDto::fromRelease);
    }
}