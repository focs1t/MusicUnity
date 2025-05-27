package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FavoriteService favoriteService;
    private final AuthorFollowingService authorFollowingService;
    private final FollowedReleasesService followedReleasesService;
    private final UserMapper userMapper;

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    public UserDTO findByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(userMapper::toDTO)
                .orElse(null);
    }

    public void updateTelegramChatId(String username, Long chatId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        user.setTelegramChatId(chatId);
        userRepository.save(user);
    }

    public List<UserDTO> findByRights(UserRole role) {
        return userRepository.findByRights(role)
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> findBlockedUsers() {
        return userRepository.findByIsBlockedTrue()
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO findByTelegramChatId(Long chatId) {
        return userRepository.findByTelegramChatId(chatId)
                .map(userMapper::toDTO)
                .orElse(null);
    }

    public UserDTO findModeratorByEmail(String email) {
        return userRepository.findByEmailAndRights(email, UserRole.MODERATOR)
                .map(userMapper::toDTO)
                .orElse(null);
    }

    public Page<UserDTO> searchUsersByUsername(String username, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCase(username, pageable)
                .map(userMapper::toDTO);
    }

    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setIsBlocked(true);
        userRepository.save(user);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setIsBlocked(false);
        userRepository.save(user);
    }

    @Transactional
    public void logout() {
        User user = getCurrentUser();
        user.setLastLogin(null);
        userRepository.save(user);
    }

    public Page<ReleaseDTO> getFavoriteReleases(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return favoriteService.getFavoriteReleasesByUser(user, pageable);
    }

    public Page<ReleaseDTO> getFavoriteReleasesByType(Long userId, ReleaseType type, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return favoriteService.getFavoriteReleasesByUserAndType(user, type, pageable);
    }

    public Page<AuthorDTO> getFollowedAuthors(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return authorFollowingService.getFollowedAuthors(user, pageable);
    }

    public Page<ReleaseDTO> getReleasesFromFollowedAuthors(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return followedReleasesService.getReleasesByFollowedAuthors(user, pageable);
    }

    public Page<ReleaseDTO> getReleasesFromFollowedAuthorsByType(Long userId, ReleaseType type, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return followedReleasesService.getReleasesByFollowedAuthorsAndType(user, type, pageable);
    }
}