package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.mapper.ReleaseMapper;
import ru.musicunity.backend.pojo.*;
import ru.musicunity.backend.pojo.enums.AuthorRole;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.GenreRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.UserFollowingRepository;
import ru.musicunity.backend.mapper.UserMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReleaseService {
    private final ReleaseRepository releaseRepository;
    private final AuthorService authorService;
    private final GenreService genreService;
    private final UserService userService;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final UserFollowingRepository userFollowingRepository;
    private final ReleaseMapper releaseMapper;
    private final UserMapper userMapper;

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public ReleaseDTO createRelease(String title, ReleaseType type, LocalDate releaseDate, String coverUrl, 
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
            Author author = authorRepository.findById(producerId)
                    .orElseThrow(() -> new RuntimeException("Author not found with id: " + producerId));
            ReleaseAuthor releaseAuthor = ReleaseAuthor.builder()
                    .release(release)
                    .author(author)
                    .build();
            release.getAuthors().add(releaseAuthor);
        }

        for (Long artistId : artistIds) {
            Author author = authorRepository.findById(artistId)
                    .orElseThrow(() -> new RuntimeException("Author not found with id: " + artistId));
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
            Optional<Author> existingAuthor = authorRepository.findByAuthorName(authorName);
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
                author = authorRepository.save(Author.builder()
                        .authorName(authorName)
                        .role(role)
                        .build());
            }
            ReleaseAuthor releaseAuthor = ReleaseAuthor.builder()
                    .release(release)
                    .author(author)
                    .build();
            release.getAuthors().add(releaseAuthor);
        }

        // Добавляем жанры
        for (Long genreId : genreIds) {
            Genre genre = genreRepository.findById(genreId)
                    .orElseThrow(() -> new RuntimeException("Genre not found with id: " + genreId));
            release.getGenres().add(genre);
        }

        return releaseMapper.toDTO(releaseRepository.save(release));
    }

    @Transactional
    @PreAuthorize("hasRole('AUTHOR')")
    public ReleaseDTO createOwnRelease(String title, ReleaseType type, LocalDate releaseDate, String coverUrl,
                                  String releaseLink, List<String> producerNames, List<String> artistNames,
                                  List<Long> producerIds, List<Long> artistIds, List<Long> genreIds, Long userId) {
        // Проверяем, что пользователь является одним из авторов
        boolean isAuthor = producerIds.stream()
                .anyMatch(producerId -> authorRepository.findById(producerId)
                        .map(author -> author.getUser() != null && author.getUser().getUserId().equals(userId))
                        .orElse(false)) ||
                artistIds.stream()
                .anyMatch(artistId -> authorRepository.findById(artistId)
                        .map(author -> author.getUser() != null && author.getUser().getUserId().equals(userId))
                        .orElse(false));
        if (!isAuthor) {
            throw new RuntimeException("User must be one of the authors");
        }

        return createRelease(title, type, releaseDate, coverUrl, releaseLink, 
                producerNames, artistNames, producerIds, artistIds, genreIds);
    }

    public Page<ReleaseDTO> getNewReleases(Pageable pageable) {
        return releaseRepository.findAllByOrderByAddedAtDesc(pageable)
                .map(releaseMapper::toDTO);
    }

    public Page<ReleaseDTO> getReleasesByAuthor(Long authorId, Pageable pageable) {
        return releaseRepository.findByAuthorsAuthorAuthorIdOrderByTypeAsc(authorId, pageable)
                .map(releaseMapper::toDTO);
    }

    public List<ReleaseDTO> getTopReleasesByAuthor(Long authorId) {
        return releaseRepository.findTop5ByAuthorsAuthorAuthorIdOrderByAverageRatingDesc(authorId)
                .stream()
                .map(releaseMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ReleaseDTO> getTopReleasesByReviews() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        return releaseRepository.findTop15ByReviewsCreatedAtAfterOrderByReviewsCountDesc(yesterday)
                .stream()
                .map(releaseMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ReleaseDTO getReleaseById(Long id) {
        return releaseRepository.findById(id)
                .map(releaseMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Release not found with id: " + id));
    }

    public Page<ReleaseDTO> getFavoriteReleasesByUser(User user, Pageable pageable) {
        return releaseRepository.findByFavoritesUserUserId(user.getUserId(), pageable)
                .map(releaseMapper::toDTO);
    }

    public Page<ReleaseDTO> getFavoriteReleasesByUserAndType(User user, ReleaseType type, Pageable pageable) {
        return releaseRepository.findByFavoritesUserUserIdAndType(user.getUserId(), type, pageable)
                .map(releaseMapper::toDTO);
    }

    @Transactional
    public void addToFavorites(Long releaseId, Long userId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new RuntimeException("Release not found with id: " + releaseId));
        User user = userMapper.toEntity(userService.getUserById(userId));

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
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new RuntimeException("Release not found with id: " + releaseId));
        release.getFavorites().removeIf(f -> f.getUser().getUserId().equals(userId));
        releaseRepository.save(release);
    }

    public Page<ReleaseDTO> getReleasesByFollowedAuthors(User user, Pageable pageable) {
        List<Author> followedAuthors = authorRepository.findByFollowingsUserUserId(user.getUserId(), Pageable.unpaged())
                .getContent();
        return releaseRepository.findByAuthorsInAndOrderByAddedAtDesc(followedAuthors, pageable)
                .map(releaseMapper::toDTO);
    }

    public Page<ReleaseDTO> getReleasesByFollowedAuthorsAndType(User user, ReleaseType type, Pageable pageable) {
        List<Author> followedAuthors = authorRepository.findByFollowingsUserUserId(user.getUserId(), Pageable.unpaged())
                .getContent();
        return releaseRepository.findByAuthorsInAndTypeOrderByAddedAtDesc(followedAuthors, type, pageable)
                .map(releaseMapper::toDTO);
    }

    public Release getReleaseEntityById(Long id) {
        return releaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Release not found with id: " + id));
    }
}