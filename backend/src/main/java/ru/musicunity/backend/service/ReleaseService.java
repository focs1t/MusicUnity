package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.pojo.*;
import ru.musicunity.backend.pojo.enums.AuthorRole;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.UserFollowingRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReleaseService {
    private final ReleaseRepository releaseRepository;
    private final AuthorService authorService;
    private final GenreService genreService;
    private final UserService userService;
    private final AuthorRepository authorRepository;
    private final UserFollowingRepository userFollowingRepository;

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public Release createRelease(String title, ReleaseType type, LocalDate releaseDate, String coverUrl, 
                               String releaseLink, List<String> producerNames, List<String> artistNames,
                               List<Long> producerIds, List<Long> artistIds, List<Long> genreIds) {
        Release release = Release.builder()
                .title(title)
                .type(type)
                .releaseDate(releaseDate)
                .coverUrl(coverUrl)
                .releaseLink(releaseLink)
                .favoritesCount(0)
                .build();

        // Добавляем существующих авторов
        for (Long producerId : producerIds) {
            Author author = authorService.getAuthorById(producerId);
            ReleaseAuthor releaseAuthor = ReleaseAuthor.builder()
                    .release(release)
                    .author(author)
                    .build();
            release.getAuthors().add(releaseAuthor);
        }

        for (Long artistId : artistIds) {
            Author author = authorService.getAuthorById(artistId);
            ReleaseAuthor releaseAuthor = ReleaseAuthor.builder()
                    .release(release)
                    .author(author)
                    .build();
            release.getAuthors().add(releaseAuthor);
        }

        // Создаем новых авторов
        List<String> allNewAuthors = new ArrayList<>();
        allNewAuthors.addAll(producerNames);
        allNewAuthors.addAll(artistNames);

        for (String authorName : allNewAuthors) {
            Optional<Author> existingAuthor = authorService.findByAuthorName(authorName);
            Author author;
            if (existingAuthor.isPresent()) {
                author = existingAuthor.get();
            } else {
                // Определяем роль автора
                AuthorRole role;
                if (producerNames.contains(authorName) && artistNames.contains(authorName)) {
                    role = AuthorRole.BOTH;
                } else if (producerNames.contains(authorName)) {
                    role = AuthorRole.PRODUCER;
                } else {
                    role = AuthorRole.ARTIST;
                }
                author = authorService.createAuthor(authorName, null, role);
            }
            ReleaseAuthor releaseAuthor = ReleaseAuthor.builder()
                    .release(release)
                    .author(author)
                    .build();
            release.getAuthors().add(releaseAuthor);
        }

        // Добавляем жанры
        for (Long genreId : genreIds) {
            Genre genre = genreService.getGenreById(genreId);
            release.getGenres().add(genre);
        }

        return releaseRepository.save(release);
    }

    @Transactional
    @PreAuthorize("hasRole('AUTHOR')")
    public Release createOwnRelease(String title, ReleaseType type, LocalDate releaseDate, String coverUrl,
                                  String releaseLink, List<String> producerNames, List<String> artistNames,
                                  List<Long> producerIds, List<Long> artistIds, List<Long> genreIds, Long userId) {
        // Проверяем, что пользователь является одним из авторов
        boolean isAuthor = producerIds.stream()
                .anyMatch(producerId -> authorService.getAuthorById(producerId).getUser().getUserId().equals(userId)) ||
                artistIds.stream()
                .anyMatch(artistId -> authorService.getAuthorById(artistId).getUser().getUserId().equals(userId));
        if (!isAuthor) {
            throw new RuntimeException("User must be one of the authors");
        }

        return createRelease(title, type, releaseDate, coverUrl, releaseLink, 
                producerNames, artistNames, producerIds, artistIds, genreIds);
    }

    public Page<Release> getNewReleases(Pageable pageable) {
        return releaseRepository.findAllByOrderByAddedAtDesc(pageable);
    }

    public Page<Release> getReleasesByAuthor(Long authorId, Pageable pageable) {
        return releaseRepository.findByAuthorsAuthorAuthorIdOrderByTypeAsc(authorId, pageable);
    }

    public List<Release> getTopReleasesByAuthor(Long authorId) {
        return releaseRepository.findTop5ByAuthorsAuthorAuthorIdOrderByAverageRatingDesc(authorId);
    }

    public List<Release> getTopReleasesByReviews() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        return releaseRepository.findTop15ByReviewsCreatedAtAfterOrderByReviewsCountDesc(yesterday);
    }

    public Release getReleaseById(Long id) {
        return releaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Release not found with id: " + id));
    }

    // Методы для работы с избранными релизами
    public Page<Release> getFavoriteReleasesByUser(User user, Pageable pageable) {
        return releaseRepository.findByFavoritesUserUserId(user.getUserId(), pageable);
    }

    public Page<Release> getFavoriteReleasesByUserAndType(User user, ReleaseType type, Pageable pageable) {
        return releaseRepository.findByFavoritesUserUserIdAndType(user.getUserId(), type, pageable);
    }

    @Transactional
    public void addToFavorites(Long releaseId, Long userId) {
        Release release = getReleaseById(releaseId);
        User user = userService.getUserById(userId);

        if (!release.getFavorites().stream().anyMatch(f -> f.getUser().getUserId().equals(userId))) {
            Favorite favorite = Favorite.builder()
                    .release(release)
                    .user(user)
                    .build();
            release.getFavorites().add(favorite);
            releaseRepository.save(release);
        }
    }

    @Transactional
    public void removeFromFavorites(Long releaseId, Long userId) {
        Release release = getReleaseById(releaseId);
        release.getFavorites().removeIf(f -> f.getUser().getUserId().equals(userId));
        releaseRepository.save(release);
    }

    // Методы для работы с релизами от подписанных авторов
    public Page<Release> getReleasesByFollowedAuthors(User user, Pageable pageable) {
        List<Author> followedAuthors = authorService.getFollowedAuthors(user, Pageable.unpaged()).getContent();
        return releaseRepository.findByAuthorsInAndOrderByAddedAtDesc(followedAuthors, pageable);
    }

    public Page<Release> getReleasesByFollowedAuthorsAndType(User user, ReleaseType type, Pageable pageable) {
        List<Author> followedAuthors = authorService.getFollowedAuthors(user, Pageable.unpaged()).getContent();
        return releaseRepository.findByAuthorsInAndTypeOrderByAddedAtDesc(followedAuthors, type, pageable);
    }

    // Методы для работы с подписками
    public Page<Author> getFollowedAuthors(User user, Pageable pageable) {
        return authorRepository.findByFollowingsUserUserId(user.getUserId(), pageable);
    }

    public Page<Author> getFollowedAuthorsByRole(User user, AuthorRole role, Pageable pageable) {
        return authorRepository.findByFollowingsUserUserIdAndRole(user.getUserId(), role, pageable);
    }
}