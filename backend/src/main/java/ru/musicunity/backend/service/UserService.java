package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.AuthorRole;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReleaseService releaseService;
    private final AuthorService authorService;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    public void updateTelegramChatId(String username, Long chatId) {
        User user = findByUsername(username);
        if (user != null) {
            user.setTelegramChatId(chatId);
            userRepository.save(user);
        }
    }

    public List<User> findByRights(UserRole role) {
        return userRepository.findByRights(role);
    }

    public User findByTelegramChatId(Long chatId) {
        return userRepository.findByTelegramChatId(chatId)
                .orElse(null);
    }

    public User findModeratorByEmail(String email) {
        return userRepository.findByEmailAndRights(email, UserRole.MODERATOR)
                .orElse(null);
    }

    public Page<User> searchUsersByUsername(String username, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCase(username, pageable);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user;
    }

    @Transactional
    public void updateOwnPassword(String currentPassword, String newPassword) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void updateOwnData(String bio, String avatarUrl) {
        User user = getCurrentUser();
        if (bio != null) {
            user.setBio(bio);
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        userRepository.save(user);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void banUser(Long userId) {
        User user = getUserById(userId);
        user.setRights(UserRole.BLOCKED);
        userRepository.save(user);
    }

    @Transactional
    public void logout() {
        User user = getCurrentUser();
        user.setLastLogin(null);
        userRepository.save(user);
    }

    public Page<Release> getFavoriteReleases(Long userId, Pageable pageable) {
        User user = getUserById(userId);
        return releaseService.getFavoriteReleasesByUser(user, pageable);
    }

    public Page<Release> getFavoriteReleasesByType(Long userId, ReleaseType type, Pageable pageable) {
        User user = getUserById(userId);
        return releaseService.getFavoriteReleasesByUserAndType(user, type, pageable);
    }

    public Page<Author> getFollowedAuthors(Long userId, Pageable pageable) {
        User user = getUserById(userId);
        return authorService.getFollowedAuthors(user, pageable);
    }

    public Page<Author> getFollowedAuthorsByRole(Long userId, AuthorRole role, Pageable pageable) {
        User user = getUserById(userId);
        return authorService.getFollowedAuthorsByRole(user, role, pageable);
    }

    public Page<Release> getReleasesFromFollowedAuthors(Long userId, Pageable pageable) {
        User user = getUserById(userId);
        return releaseService.getReleasesByFollowedAuthors(user, pageable);
    }

    public Page<Release> getReleasesFromFollowedAuthorsByType(Long userId, ReleaseType type, Pageable pageable) {
        User user = getUserById(userId);
        return releaseService.getReleasesByFollowedAuthorsAndType(user, type, pageable);
    }
}