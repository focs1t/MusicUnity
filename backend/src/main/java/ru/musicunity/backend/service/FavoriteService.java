package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.exception.ReleaseNotFoundException;
import ru.musicunity.backend.exception.UserNotFoundException;
import ru.musicunity.backend.mapper.ReleaseMapper;
import ru.musicunity.backend.pojo.Favorite;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final ReleaseRepository releaseRepository;
    private final UserRepository userRepository;
    private final ReleaseMapper releaseMapper;

    public Page<ReleaseDTO> getFavoriteReleasesByUser(User user, Pageable pageable) {
        return releaseRepository.findByFavoritesUserUserId(user.getUserId(), pageable)
                .map(releaseMapper::toDTO);
    }

    @Transactional
    public void addToFavorites(Long releaseId, Long userId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ReleaseNotFoundException(releaseId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!release.getFavorites().stream().anyMatch(f -> f.getUser().getUserId().equals(userId))) {
            Favorite favorite = Favorite.builder()
                    .release(release)
                    .user(user)
                    .build();
            release.getFavorites().add(favorite);
            release.setFavoritesCount(release.getFavoritesCount() + 1);
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
            release.setFavoritesCount(release.getFavoritesCount() - 1);
            releaseRepository.save(release);
        }
    }
} 