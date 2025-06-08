package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.dto.UserRatingDTO;
import ru.musicunity.backend.exception.UserNotFoundException;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.Audit;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.pojo.enums.LikeType;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.AuditRepository;
import ru.musicunity.backend.repository.LikeRepository;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AuditRepository auditRepository;
    private final LikeRepository likeRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final FavoriteService favoriteService;
    private final AuthorFollowingService authorFollowingService;
    private final FollowedReleasesService followedReleasesService;
    private final UserMapper userMapper;

    /**
     * Получение топ-100 пользователей по рейтингу
     * @return Список из 100 пользователей, отсортированных по рейтингу
     */
    public List<UserRatingDTO> getTop100Users() {
        // Получаем всех не заблокированных пользователей
        List<User> activeUsers = userRepository.findByIsBlockedFalse(Pageable.unpaged()).getContent();
        
        // Создаем список DTO с рейтингом
        List<UserRatingDTO> ratingList = new ArrayList<>();
        
        for (User user : activeUsers) {
            // Пропускаем пользователей с ролью ADMIN
            if (user.getRights() == UserRole.ADMIN) {
                continue;
            }
            
            // Количество авторских лайков (лайки, которые получили рецензии пользователя)
            Long authorLikes = likeRepository.countByReviewAuthorUserIdAndType(user.getUserId(), LikeType.AUTHOR);
            
            // Количество рецензий пользователя
            Long reviews = reviewRepository.countByUser(user.getUserId());
            
            // Количество поставленных лайков
            Long likesGiven = likeRepository.countByUserUserId(user.getUserId());
            
            // Количество полученных лайков
            Long likesReceived = likeRepository.countByReviewAuthorUserIdAndType(user.getUserId(), LikeType.REGULAR);
            
            // Расчет общего количества баллов
            int points = (authorLikes.intValue() * 5) + 
                          (reviews.intValue() * 3) + 
                          (likesGiven.intValue() * 1) + 
                          (likesReceived.intValue() * 2);
            
            UserRatingDTO ratingDTO = UserRatingDTO.builder()
                    .id(user.getUserId())
                    .username(user.getUsername())
                    .avatarUrl(user.getAvatarUrl())
                    .points(points)
                    .authorLikes(authorLikes.intValue())
                    .reviews(reviews.intValue())
                    .likesGiven(likesGiven.intValue())
                    .likesReceived(likesReceived.intValue())
                    .build();
            
            ratingList.add(ratingDTO);
        }
        
        // Сортируем по количеству баллов (по убыванию)
        List<UserRatingDTO> top100 = ratingList.stream()
                .sorted(Comparator.comparing(UserRatingDTO::getPoints).reversed())
                .limit(100)
                .collect(Collectors.toList());
        
        return top100;
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    public UserDTO findByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(userMapper::toDTO)
                .orElse(null);
    }

    public Page<UserDTO> findByRights(UserRole role, Pageable pageable) {
        return userRepository.findByRights(role, pageable)
                .map(userMapper::toDTO);
    }

    public Page<UserDTO> findBlockedUsers(Pageable pageable) {
        return userRepository.findByBlockedStatus(pageable)
                .map(userMapper::toDTO);
    }

    public Page<UserDTO> searchUsersByUsername(String username, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCase(username, pageable)
                .map(userMapper::toDTO);
    }

    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь с именем " + username + " не найден"));
    }

    @Transactional
    public void updateOwnPassword(String currentPassword, String newPassword) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Неверный пароль");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void updateOwnData(String bio, String avatarUrl, String telegramChatId) {
        User user = getCurrentUser();
        if (bio != null) {
            user.setBio(bio);
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        if (telegramChatId != null) {
            try {
                Long telegramId = telegramChatId.isEmpty() ? null : Long.parseLong(telegramChatId);
                user.setTelegramChatId(telegramId);
            } catch (NumberFormatException e) {
                // Если формат неверный, игнорируем
            }
        }
        userRepository.save(user);
    }

    @Transactional
    public void banUserAsAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.setIsBlocked(true);

        userRepository.save(user);
    }

    @Transactional
    public void banUser(Long userId) {
        // Получаем текущего пользователя (модератора)
        User currentUser = getCurrentUser();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.setIsBlocked(true);

        // Создаем запись аудита
        Audit audit = Audit.builder()
                .moderator(currentUser)
                .actionType(AuditAction.USER_BLOCK)
                .targetId(userId)
                .performedAt(LocalDateTime.now())
                .build();
        auditRepository.save(audit);

        userRepository.save(user);
    }

    @Transactional
    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.setIsBlocked(false);
        userRepository.save(user);
    }

    @Transactional
    public void changeUserRole(Long userId, UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.setRights(role);
        userRepository.save(user);
    }

    public Page<ReleaseDTO> getFavoriteReleases(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return favoriteService.getFavoriteReleasesByUser(user, pageable);
    }

    public Page<AuthorDTO> getFollowedAuthors(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return authorFollowingService.getFollowedAuthors(user, pageable);
    }

    public Page<ReleaseDTO> getReleasesFromFollowedAuthors(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return followedReleasesService.getReleasesByFollowedAuthors(user, pageable);
    }

    public Page<UserDTO> findByUsernameContaining(String username, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCase(username, pageable)
                .map(userMapper::toDTO);
    }

    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toDTO);
    }

    public Page<UserDTO> findActiveUsers(Pageable pageable) {
        return userRepository.findByIsBlockedFalse(pageable)
                .map(userMapper::toDTO);
    }

    public Page<UserDTO> filterByRole(Page<UserDTO> users, UserRole role) {
        return new PageImpl<>(
            users.getContent().stream()
                .filter(user -> user.getRights() == role)
                .collect(Collectors.toList()),
            users.getPageable(),
            users.getTotalElements()
        );
    }

    public Page<UserDTO> filterBlocked(Page<UserDTO> users) {
        return new PageImpl<>(
            users.getContent().stream()
                .filter(UserDTO::getIsBlocked)
                .collect(Collectors.toList()),
            users.getPageable(),
            users.getTotalElements()
        );
    }

    public Page<UserDTO> filterActive(Page<UserDTO> users) {
        return new PageImpl<>(
            users.getContent().stream()
                .filter(user -> !user.getIsBlocked())
                .collect(Collectors.toList()),
            users.getPageable(),
            users.getTotalElements()
        );
    }
}