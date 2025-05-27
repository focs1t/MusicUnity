package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.dto.CreateReleaseRequest;
import ru.musicunity.backend.mapper.ReleaseMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.*;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.ReviewType;
import ru.musicunity.backend.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final ReleaseMapper releaseMapper;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final ReleaseAuthorService releaseAuthorService;

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public ReleaseDTO createRelease(CreateReleaseRequest request) {
        // Создаем релиз
        Release release = Release.builder()
                .title(request.getTitle())
                .type(request.getType())
                .releaseDate(request.getReleaseDate())
                .coverUrl(request.getCoverUrl())
                .releaseLink(request.getReleaseLink())
                .favoritesCount(0)
                .build();
        
        release = releaseRepository.save(release);

        // Добавляем авторов
        for (CreateReleaseRequest.AuthorRoleRequest authorRequest : request.getAuthors()) {
            // Проверяем существует ли автор
            Optional<Author> existingAuthor = authorRepository.findByAuthorName(authorRequest.getAuthorName());
            Author author;

            if (existingAuthor.isPresent()) {
                author = existingAuthor.get();
                // Обновляем роли автора если необходимо
                if (authorRequest.isArtist() && !author.getIsArtist()) {
                    author.setIsArtist(true);
                }
                if (authorRequest.isProducer() && !author.getIsProducer()) {
                    author.setIsProducer(true);
                }
                author = authorRepository.save(author);
            } else {
                // Создаем нового автора
                author = Author.builder()
                        .authorName(authorRequest.getAuthorName())
                        .isArtist(authorRequest.isArtist())
                        .isProducer(authorRequest.isProducer())
                        .isVerified(false)
                        .followingCount(0)
                        .build();
                author = authorRepository.save(author);
            }

            // Создаем связь автора с релизом
            ReleaseAuthor releaseAuthor = ReleaseAuthor.builder()
                    .id(new ReleaseAuthor.ReleaseAuthorId(release.getReleaseId(), author.getAuthorId()))
                    .release(release)
                    .author(author)
                    .isArtist(authorRequest.isArtist())
                    .isProducer(authorRequest.isProducer())
                    .build();
            release.getAuthors().add(releaseAuthor);
        }

        // Добавляем жанры
        for (Long genreId : request.getGenreIds()) {
            Genre genre = genreRepository.findById(genreId)
                    .orElseThrow(() -> new RuntimeException("Genre not found with id: " + genreId));
            release.getGenres().add(genre);
        }

        return releaseMapper.toDTO(releaseRepository.save(release));
    }

    @Transactional
    @PreAuthorize("hasRole('AUTHOR')")
    public ReleaseDTO createOwnRelease(CreateReleaseRequest request) {
        // Получаем текущего пользователя
        User currentUser = userService.getCurrentUser();
        
        // Проверяем, что пользователь является автором
        Author userAuthor = authorRepository.findByUserUserId(currentUser.getUserId())
                .orElseThrow(() -> new RuntimeException("User is not an author"));

        // Проверяем, что пользователь указан как один из авторов
        boolean isUserIncluded = request.getAuthors().stream()
                .anyMatch(author -> author.getAuthorName().equals(userAuthor.getAuthorName()));

        if (!isUserIncluded) {
            throw new RuntimeException("Current user must be one of the authors");
        }

        return createRelease(request);
    }

    // Методы для управления авторами релиза
    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void addAuthorToRelease(Long releaseId, Long authorId, boolean isArtist, boolean isProducer) {
        Release release = getReleaseEntityById(releaseId);
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorId));
        releaseAuthorService.addAuthorToRelease(release, author, isArtist, isProducer);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void removeAuthorFromRelease(Long releaseId, Long authorId) {
        releaseAuthorService.removeAuthorFromRelease(releaseId, authorId);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void updateAuthorRoles(Long releaseId, Long authorId, boolean isArtist, boolean isProducer) {
        releaseAuthorService.updateAuthorRoles(releaseId, authorId, isArtist, isProducer);
    }

    // Существующие методы для получения релизов
    public Page<ReleaseDTO> getNewReleases(Pageable pageable) {
        return releaseRepository.findAllByOrderByAddedAtDesc(pageable)
                .map(releaseMapper::toDTO);
    }

    public Page<ReleaseDTO> getReleasesByAuthor(Long authorId, Pageable pageable) {
        Sort sort = Sort.by("type").ascending();
        Pageable pageableWithSort = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return releaseRepository.findByAuthorId(authorId, pageableWithSort)
                .map(releaseMapper::toDTO);
    }

    public List<ReleaseDTO> getTopReleasesByAuthor(Long authorId) {
        return releaseRepository.findTop5ByAuthorsAuthorAuthorIdOrderByAverageRatingDesc(authorId, ReviewType.EXTENDED)
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

    public Release getReleaseEntityById(Long id) {
        return releaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Release not found with id: " + id));
    }
}