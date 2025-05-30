package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.dto.CreateReleaseRequest;
import ru.musicunity.backend.dto.CreateOwnReleaseRequest;
import ru.musicunity.backend.exception.*;
import ru.musicunity.backend.mapper.ReleaseMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.*;
import ru.musicunity.backend.pojo.enums.ReviewType;
import ru.musicunity.backend.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReleaseService {
    private final ReleaseRepository releaseRepository;
    private final UserService userService;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final ReleaseMapper releaseMapper;
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
                    .orElseThrow(() -> new GenreNotFoundException(genreId));
            release.getGenres().add(genre);
        }

        return releaseMapper.toDTO(releaseRepository.save(release));
    }

    @Transactional
    @PreAuthorize("hasRole('AUTHOR')")
    public ReleaseDTO createOwnRelease(CreateOwnReleaseRequest request) {
        // Получаем текущего пользователя
        User currentUser = userService.getCurrentUser();
        
        // Проверяем, что пользователь является автором
        Author userAuthor = authorRepository.findByUserUserId(currentUser.getUserId())
                .orElseThrow(UserIsNotAuthorException::new);

        // Проверяем, что выбрана хотя бы одна роль
        if (!request.isArtist() && !request.isProducer()) {
            throw new NoRoleSelectedException();
        }

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

        // Добавляем текущего пользователя как автора
        ReleaseAuthor userReleaseAuthor = ReleaseAuthor.builder()
                .id(new ReleaseAuthor.ReleaseAuthorId(release.getReleaseId(), userAuthor.getAuthorId()))
                .release(release)
                .author(userAuthor)
                .isArtist(request.isArtist())
                .isProducer(request.isProducer())
                .build();
        release.getAuthors().add(userReleaseAuthor);

        // Добавляем других авторов
        if (request.getOtherAuthors() != null) {
            for (CreateOwnReleaseRequest.AuthorRoleRequest authorRequest : request.getOtherAuthors()) {
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
        }

        // Добавляем жанры
        for (Long genreId : request.getGenreIds()) {
            Genre genre = genreRepository.findById(genreId)
                    .orElseThrow(() -> new GenreNotFoundException(genreId));
            release.getGenres().add(genre);
        }

        return releaseMapper.toDTO(releaseRepository.save(release));
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

    public Page<ReleaseDTO> getNewReleases(Pageable pageable) {
        return releaseRepository.findAllSorted(pageable)
                .map(releaseMapper::toDTO);
    }

    public Page<ReleaseDTO> getReleasesByAuthor(Long authorId, Pageable pageable) {
        return releaseRepository.findByAuthorId(authorId, pageable)
                .map(releaseMapper::toDTO);
    }

    public ReleaseDTO getReleaseById(Long id) {
        return releaseRepository.findById(id)
                .map(releaseMapper::toDTO)
                .orElseThrow(() -> new ReleaseNotFoundException(id));
    }

    public Release getReleaseEntityById(Long id) {
        return releaseRepository.findById(id)
                .orElseThrow(() -> new ReleaseNotFoundException(id));
    }
}