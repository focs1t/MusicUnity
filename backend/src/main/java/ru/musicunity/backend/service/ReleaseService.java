package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.dto.CreateReleaseRequest;
import ru.musicunity.backend.dto.CreateOwnReleaseRequest;
import ru.musicunity.backend.exception.*;
import ru.musicunity.backend.mapper.ReleaseMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.*;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.pojo.enums.ReviewType;
import ru.musicunity.backend.repository.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
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
    private final AuditRepository auditRepository;

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public ReleaseDTO createRelease(CreateReleaseRequest request) {
        // Получаем текущего пользователя (модератора)
        User currentUser = userService.getCurrentUser();
        
        // Создаем релиз
        Release release = Release.builder()
                .title(request.getTitle())
                .type(request.getType())
                .releaseDate(request.getReleaseDate())
                .coverUrl(request.getCoverUrl())
                .releaseLink(request.getReleaseLink())
                .favoritesCount(0)
                .isDeleted(false)
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
                        .isDeleted(false)
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
        
        // Создаем запись аудита
        Audit audit = Audit.builder()
                .moderator(currentUser)
                .actionType(AuditAction.RELEASE_ADD)
                .targetId(release.getReleaseId())
                .performedAt(LocalDateTime.now())
                .build();
        auditRepository.save(audit);

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
                .isDeleted(false)
                .build();
        
        release = releaseRepository.save(release);

        // Обновляем роли текущего автора если необходимо
        if (request.isArtist() && !userAuthor.getIsArtist()) {
            userAuthor.setIsArtist(true);
        }
        if (request.isProducer() && !userAuthor.getIsProducer()) {
            userAuthor.setIsProducer(true);
        }
        userAuthor = authorRepository.save(userAuthor);
        
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
                            .isDeleted(false)
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
        
        // Создаем запись аудита
        Audit audit = Audit.builder()
                .moderator(currentUser)
                .actionType(AuditAction.RELEASE_CREATE_OWN)
                .targetId(release.getReleaseId())
                .performedAt(LocalDateTime.now())
                .build();
        auditRepository.save(audit);

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

    public ReleaseDTO getReleaseByIdWithAccessControl(Long id) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new ReleaseNotFoundException(id));
        
        // Если релиз удален, проверяем права доступа
        if (release.getIsDeleted()) {
            // Проверяем, является ли текущий пользователь админом
            boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                    .getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role -> role.equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                throw new ReleaseNotFoundException(id);
            }
        }
        
        return releaseMapper.toDTO(release);
    }

    public Release getReleaseEntityById(Long id) {
        return releaseRepository.findById(id)
                .orElseThrow(() -> new ReleaseNotFoundException(id));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void softDeleteRelease(Long releaseId) {
        // Получаем текущего пользователя (модератора)
        User currentUser = userService.getCurrentUser();
        
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ReleaseNotFoundException(releaseId));
        release.setIsDeleted(true);
        releaseRepository.save(release);
        
        // Пересчитываем favoritesCount для всех релизов, исключая удаленные
        List<Release> allReleases = releaseRepository.findAll();
        for (Release r : allReleases) {
            if (!r.getIsDeleted()) {
                long activeFavoritesCount = r.getFavorites().stream()
                        .filter(f -> !f.getRelease().getIsDeleted())
                        .count();
                r.setFavoritesCount((int) activeFavoritesCount);
            }
        }
        releaseRepository.saveAll(allReleases);
        
        // Создаем запись аудита
        Audit audit = Audit.builder()
                .moderator(currentUser)
                .actionType(AuditAction.RELEASE_DELETE)
                .targetId(releaseId)
                .performedAt(LocalDateTime.now())
                .build();
        auditRepository.save(audit);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void hardDeleteRelease(Long releaseId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ReleaseNotFoundException(releaseId));
        releaseRepository.delete(release);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void restoreRelease(Long releaseId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ReleaseNotFoundException(releaseId));
        release.setIsDeleted(false);
        releaseRepository.save(release);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Page<ReleaseDTO> getAllDeletedReleases(Pageable pageable) {
        return releaseRepository.findAllDeleted(pageable)
                .map(releaseMapper::toDTO);
    }

    public Page<ReleaseDTO> getAllByUser(Long userId, Pageable pageable) {
        return releaseRepository.findByFavoritesUserUserIdAndIsDeletedFalse(userId, pageable)
                .map(releaseMapper::toDTO);
    }

    public Page<ReleaseDTO> getAllSorted(Pageable pageable) {
        return releaseRepository.findAllSorted(pageable)
                .map(releaseMapper::toDTO);
    }

    /**
     * Получение топ релизов по рейтингу с фильтрацией
     */
    public Page<ReleaseDTO> getTopRatedReleases(Integer year, Integer month, String releaseType, Pageable pageable) {
        LocalDate startDate = null;
        LocalDate endDate = null;
        
        // Формируем даты для фильтрации
        if (year != null) {
            if (month != null) {
                // Фильтруем по конкретному месяцу
                startDate = LocalDate.of(year, month, 1);
                endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            } else {
                // Фильтруем по году
                startDate = LocalDate.of(year, 1, 1);
                endDate = LocalDate.of(year, 12, 31);
            }
        }
        
        // Преобразуем строку типа релиза в enum
        ru.musicunity.backend.pojo.enums.ReleaseType type = null;
        if (releaseType != null && !releaseType.isEmpty()) {
            try {
                type = ru.musicunity.backend.pojo.enums.ReleaseType.valueOf(releaseType.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Если тип не найден, игнорируем фильтр
            }
        }
        
        // Выбираем подходящий метод репозитория в зависимости от фильтров
        Page<Release> releases;
        if (type != null && startDate != null && endDate != null) {
            // Есть и тип, и даты
            releases = releaseRepository.findTopRatedReleasesWithTypeAndDate(type, startDate, endDate, pageable);
        } else if (type != null) {
            // Только тип, без дат
            releases = releaseRepository.findTopRatedReleasesByTypeOnly(type, pageable);
        } else if (startDate != null && endDate != null) {
            // Только даты, без типа
            releases = releaseRepository.findTopRatedReleasesWithDate(startDate, endDate, pageable);
        } else {
            // Без фильтров
            releases = releaseRepository.findTopRatedReleasesWithoutDate(pageable);
        }
        
        return releases.map(releaseMapper::toDTO);
    }

    /**
     * Получение топ релизов определенного типа по рейтингу
     */
    public Page<ReleaseDTO> getTopRatedReleasesByType(String releaseType, Integer year, Integer month, Pageable pageable) {
        LocalDate startDate = null;
        LocalDate endDate = null;
        
        // Формируем даты для фильтрации
        if (year != null) {
            if (month != null) {
                // Фильтруем по конкретному месяцу
                startDate = LocalDate.of(year, month, 1);
                endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            } else {
                // Фильтруем по году
                startDate = LocalDate.of(year, 1, 1);
                endDate = LocalDate.of(year, 12, 31);
            }
        }
        
        // Преобразуем строку типа релиза в enum
        ru.musicunity.backend.pojo.enums.ReleaseType type;
        try {
            type = ru.musicunity.backend.pojo.enums.ReleaseType.valueOf(releaseType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Неподдерживаемый тип релиза: " + releaseType);
        }
        
        // Выбираем подходящий метод репозитория в зависимости от наличия дат
        Page<Release> releases;
        if (startDate != null && endDate != null) {
            // С датами
            releases = releaseRepository.findTopRatedReleasesByTypeWithDate(type, startDate, endDate, pageable);
        } else {
            // Без дат
            releases = releaseRepository.findTopRatedReleasesByTypeWithoutDate(type, pageable);
        }
        
        return releases.map(releaseMapper::toDTO);
    }

    /**
     * Получение доступных годов для фильтрации
     */
    public List<Integer> getAvailableYears() {
        return releaseRepository.findDistinctYears();
    }

    /**
     * Получение доступных годов для определенного типа релиза
     */
    public List<Integer> getAvailableYearsByType(String releaseType) {
        ru.musicunity.backend.pojo.enums.ReleaseType type;
        try {
            type = ru.musicunity.backend.pojo.enums.ReleaseType.valueOf(releaseType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Неподдерживаемый тип релиза: " + releaseType);
        }
        return releaseRepository.findDistinctYearsByType(type);
    }

    /**
     * Получение доступных месяцев для определенного года
     */
    public List<Integer> getAvailableMonthsByYear(Integer year) {
        return releaseRepository.findDistinctMonthsByYear(year);
    }

    /**
     * Получение доступных месяцев для определенного года и типа релиза
     */
    public List<Integer> getAvailableMonthsByYearAndType(Integer year, String releaseType) {
        ru.musicunity.backend.pojo.enums.ReleaseType type;
        try {
            type = ru.musicunity.backend.pojo.enums.ReleaseType.valueOf(releaseType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Неподдерживаемый тип релиза: " + releaseType);
        }
        return releaseRepository.findDistinctMonthsByYearAndType(year, type);
    }

    /**
     * Поиск релизов по названию
     */
    public Page<ReleaseDTO> searchReleasesByTitle(String title, Pageable pageable) {
        return releaseRepository.findByTitleContainingIgnoreCase(title, pageable)
                .map(releaseMapper::toDTO);
    }
}