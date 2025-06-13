package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.exception.AuthorAlreadyExistsException;
import ru.musicunity.backend.exception.AuthorNotFoundException;
import ru.musicunity.backend.mapper.AuthorMapper;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.UserFollowing;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.UserFollowingRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.UserRepository;
import ru.musicunity.backend.repository.LikeRepository;
import ru.musicunity.backend.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository authorRepository;
    private final UserFollowingRepository userFollowingRepository;
    private final ReleaseRepository releaseRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final UserService userService;
    private final AuthorMapper authorMapper;

    public Page<AuthorDTO> findAllSorted(Pageable pageable) {
        return authorRepository.findAllSorted(pageable)
                .map(this::toDTOWithRatings);
    }

    public Page<AuthorDTO> searchAuthorsByName(String name, Pageable pageable) {
        return authorRepository.findByAuthorNameContainingIgnoreCase(name, pageable)
                .map(this::toDTOWithRatings);
    }

    public AuthorDTO getAuthorById(Long id) {
        return authorRepository.findById(id)
                .map(this::toDTOWithRatings)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + id));
    }

    public Optional<AuthorDTO> findByAuthorName(String authorName) {
        return authorRepository.findByAuthorName(authorName)
                .map(this::toDTOWithRatings);
    }

    public Page<AuthorDTO> findArtists(Pageable pageable) {
        return authorRepository.findByIsArtistTrue(pageable)
                .map(this::toDTOWithRatings);
    }

    public Page<AuthorDTO> findProducers(Pageable pageable) {
        return authorRepository.findByIsProducerTrue(pageable)
                .map(this::toDTOWithRatings);
    }

    public Page<AuthorDTO> findVerifiedAuthors(Pageable pageable) {
        return authorRepository.findByIsVerifiedTrue(pageable)
                .map(this::toDTOWithRatings);
    }

    public Page<AuthorDTO> findNotVerifiedAuthors(Pageable pageable) {
        return authorRepository.findByIsVerifiedFalse(pageable)
                .map(this::toDTOWithRatings);
    }

    public Page<AuthorDTO> findVerifiedArtists(Pageable pageable) {
        return authorRepository.findByIsVerifiedTrueAndIsArtistTrue(pageable)
                .map(this::toDTOWithRatings);
    }

    public Page<AuthorDTO> findVerifiedProducers(Pageable pageable) {
        return authorRepository.findByIsVerifiedTrueAndIsProducerTrue(pageable)
                .map(this::toDTOWithRatings);
    }

    @Transactional
    public void updateAuthorDataByUser(String bio, String avatarUrl) {
        User currentUser = userService.getCurrentUser();
        
        Author author = authorRepository.findByUserUserId(currentUser.getUserId())
                .orElseThrow(() -> new RuntimeException("Автор не найден для текущего пользователя"));
        
        if (bio != null) {
            author.setBio(bio);
        }
        
        if (avatarUrl != null) {
            author.setAvatarUrl(avatarUrl);
        }
        
        authorRepository.save(author);
    }

    private AuthorDTO toDTOWithRatings(Author author) {
        AuthorDTO dto = authorMapper.toDTO(author);
        
        Double albumExtendedRating = authorRepository.findAverageAlbumExtendedRating(author.getAuthorId());
        Double albumSimpleRating = authorRepository.findAverageAlbumSimpleRating(author.getAuthorId());
        Double singleEpExtendedRating = authorRepository.findAverageSingleEpExtendedRating(author.getAuthorId());
        Double singleEpSimpleRating = authorRepository.findAverageSingleEpSimpleRating(author.getAuthorId());
        

        
        dto.setAverageAlbumExtendedRating(albumExtendedRating);
        dto.setAverageAlbumSimpleRating(albumSimpleRating);
        dto.setAverageSingleEpExtendedRating(singleEpExtendedRating);
        dto.setAverageSingleEpSimpleRating(singleEpSimpleRating);
        return dto;
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO updateAuthor(Long id, AuthorDTO updatedAuthor) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AuthorNotFoundException(id));
        
        if (updatedAuthor.getAuthorName() != null) {
            author.setAuthorName(updatedAuthor.getAuthorName());
        }
        if (updatedAuthor.getAvatarUrl() != null) {
            author.setAvatarUrl(updatedAuthor.getAvatarUrl());
        }
        if (updatedAuthor.getBio() != null) {
            author.setBio(updatedAuthor.getBio());
        }
        if (updatedAuthor.getIsArtist() != null) {
            author.setIsArtist(updatedAuthor.getIsArtist());
        }
        if (updatedAuthor.getIsProducer() != null) {
            author.setIsProducer(updatedAuthor.getIsProducer());
        }
        
        return authorMapper.toDTO(authorRepository.save(author));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO createAuthor(String authorName, Boolean isArtist, Boolean isProducer) {
        // Проверяем, не существует ли уже автор с таким именем
        if (authorRepository.findByAuthorName(authorName).isPresent()) {
            throw new AuthorAlreadyExistsException(authorName);
        }

        Author author = Author.builder()
                .authorName(authorName)
                .isArtist(isArtist)
                .isProducer(isProducer)
                .isVerified(false)
                .followingCount(0)
                .isDeleted(false)
                .build();

        return authorMapper.toDTO(authorRepository.save(author));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void softDeleteAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        author.setIsDeleted(true);
        authorRepository.save(author);
        
        // Помечаем ВСЕ релизы автора как удаленные независимо от других авторов
        author.getReleases().forEach(releaseAuthor -> {
            Release release = releaseAuthor.getRelease();
            
            // Удаляем релиз если он еще не удален
            if (!release.getIsDeleted()) {
                release.setIsDeleted(true);
                releaseRepository.save(release);
            }
        });
        
        // Пересчитываем followingCount для всех авторов, исключая удаленных
        List<Author> allAuthors = authorRepository.findAll();
        for (Author a : allAuthors) {
            if (!a.getIsDeleted()) {
                long activeFollowingsCount = a.getFollowings().stream()
                        .filter(f -> !f.getAuthor().getIsDeleted())
                        .count();
                a.setFollowingCount((int) activeFollowingsCount);
            }
        }
        authorRepository.saveAll(allAuthors);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void hardDeleteAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        
        // Находим ВСЕ релизы автора (включая удаленные) через репозиторий
        List<Release> authorReleases = releaseRepository.findAllByAuthorId(authorId);
        
        // Каскадное удаление всех релизов автора
        authorReleases.forEach(release -> {
            // Удаляем все рецензии релиза
            release.getReviews().forEach(review -> {
                // Удаляем все лайки рецензии
                likeRepository.findAllByReviewId(review.getReviewId()).forEach(like -> {
                    likeRepository.delete(like);
                });
            });
            
            // Удаляем все избранные релиза
            release.getFavorites().clear();
            
            // Удаляем связи с жанрами
            release.getGenres().clear();
            
            // Удаляем связи с авторами
            release.getAuthors().clear();
            
            // Удаляем релиз
            releaseRepository.delete(release);
        });
        
        // Если автор верифицирован и связан с пользователем, блокируем пользователя
        if (author.getIsVerified() && author.getUser() != null) {
            User user = author.getUser();
            user.setIsBlocked(true);
            userRepository.save(user);
        }
        
        // Удаляем все подписки на автора
        author.getFollowings().clear();
        
        // Удаляем автора
        authorRepository.delete(author);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void restoreAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        author.setIsDeleted(false);
        authorRepository.save(author);
        
        // Находим ВСЕ релизы автора (включая удаленные) и восстанавливаем их
        List<Release> authorReleases = releaseRepository.findAllByAuthorId(authorId);
        
        authorReleases.forEach(release -> {
            if (release.getIsDeleted()) {
                release.setIsDeleted(false);
                releaseRepository.save(release);
            }
        });
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Page<AuthorDTO> getAllDeletedAuthors(Pageable pageable) {
        return authorRepository.findAllDeleted(pageable)
                .map(authorMapper::toDTO);
    }

    public Page<AuthorDTO> getAllAuthors(Pageable pageable) {
        return authorRepository.findAllNotDeleted(pageable)
                .map(authorMapper::toDTO);
    }

    public Page<AuthorDTO> searchAuthors(String search, Pageable pageable) {
        return authorRepository.findByAuthorNameContainingIgnoreCase(search, pageable)
                .map(authorMapper::toDTO);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO verifyAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        author.setIsVerified(true);
        return authorMapper.toDTO(authorRepository.save(author));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO unverifyAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        author.setIsVerified(false);
        return authorMapper.toDTO(authorRepository.save(author));
    }

    public AuthorDTO getAuthorByIdWithAccessControl(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AuthorNotFoundException(id));
        
        // Если автор удален, проверяем права доступа
        if (author.getIsDeleted()) {
            // Проверяем, является ли текущий пользователь админом
            boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                    .getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role -> role.equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                throw new AuthorNotFoundException(id);
            }
        }
        
        return toDTOWithRatings(author);
    }
}
