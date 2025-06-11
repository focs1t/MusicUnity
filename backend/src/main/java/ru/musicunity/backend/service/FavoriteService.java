package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.exception.AuthorCannotAddToFavoritesException;
import ru.musicunity.backend.exception.AuthorCannotLikeOthersReviewsException;
import ru.musicunity.backend.exception.ReleaseNotFoundException;
import ru.musicunity.backend.exception.UserNotFoundException;
import ru.musicunity.backend.mapper.ReleaseMapper;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Favorite;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.UserRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final ReleaseRepository releaseRepository;
    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final ReleaseMapper releaseMapper;

    public Page<ReleaseDTO> getFavoriteReleasesByUser(User user, Pageable pageable) {
        return releaseRepository.findByFavoritesUserUserIdAndIsDeletedFalse(user.getUserId(), pageable)
                .map(releaseMapper::toDTO);
    }

    @Transactional
    public void addToFavorites(Long releaseId, Long userId) {
        // Проверяем, является ли пользователь автором
        Optional<Author> author = authorRepository.findByUserUserId(userId);
        if (author.isPresent()) {
            throw new AuthorCannotAddToFavoritesException();
        }
        
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ReleaseNotFoundException(releaseId));
        
        // Проверяем, не удален ли релиз
        if (release.getIsDeleted()) {
            throw new ReleaseNotFoundException(releaseId);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!release.getFavorites().stream().anyMatch(f -> f.getUser().getUserId().equals(userId))) {
            Favorite favorite = Favorite.builder()
                    .release(release)
                    .user(user)
                    .build();
            release.getFavorites().add(favorite);
            
            // Пересчитываем количество избранных, исключая удаленные релизы
            long activeFavoritesCount = release.getFavorites().stream()
                    .filter(f -> !f.getRelease().getIsDeleted())
                    .count();
            release.setFavoritesCount((int) activeFavoritesCount);
            
            releaseRepository.save(release);
        }
    }

    @Transactional
    public void removeFromFavorites(Long releaseId, Long userId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ReleaseNotFoundException(releaseId));
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (release.getFavorites().removeIf(f -> f.getUser().getUserId().equals(userId))) {
            // Пересчитываем количество избранных, исключая удаленные релизы
            long activeFavoritesCount = release.getFavorites().stream()
                    .filter(f -> !f.getRelease().getIsDeleted())
                    .count();
            release.setFavoritesCount((int) activeFavoritesCount);
            
            releaseRepository.save(release);
        }
    }
} 