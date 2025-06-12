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
import ru.musicunity.backend.exception.AuthorNotFoundException;
import ru.musicunity.backend.exception.UserNotFoundException;
import ru.musicunity.backend.mapper.AuthorMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.Audit;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.pojo.enums.LikeType;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.AuditRepository;
import ru.musicunity.backend.repository.AuthorRepository;
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
    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;

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
            // Пропускаем пользователей с ролью ADMIN или AUTHOR
            if (user.getRights() == UserRole.ADMIN || user.getRights() == UserRole.AUTHOR) {
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
        
        // Запрещаем назначать роль ADMIN
        if (role == UserRole.ADMIN) {
            throw new RuntimeException("Нельзя назначить роль ADMIN через админ панель");
        }
        
        // Запрещаем изменять роль ADMIN пользователей
        if (user.getRights() == UserRole.ADMIN) {
            throw new RuntimeException("Нельзя изменить роль администратора");
        }
        
        user.setRights(role);
        userRepository.save(user);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void demoteModerator(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        
        // Проверяем, что пользователь действительно модератор
        if (user.getRights() != UserRole.MODERATOR) {
            throw new RuntimeException("Пользователь не является модератором");
        }
        
        // Получаем текущего админа
        User currentAdmin = getCurrentUser();
        
        // Откатываем все активные действия этого модератора
        List<Audit> moderatorActions = auditRepository.findByModeratorAndIsRolledBack(user, false);
        for (Audit action : moderatorActions) {
            // Откатываем каждое действие через AuditService
            try {
                rollbackModeratorsAction(action);
            } catch (Exception e) {
                // Логируем ошибку, но продолжаем откатывать остальные действия
                System.err.println("Ошибка при откате действия " + action.getLogId() + ": " + e.getMessage());
            }
        }
        
        // Понижаем до обычного пользователя
        user.setRights(UserRole.USER);
        userRepository.save(user);
        
        // Создаем запись аудита о понижении
        Audit audit = Audit.builder()
                .moderator(currentAdmin)
                .actionType(AuditAction.USER_DEMOTE_FROM_MODERATOR)
                .targetId(userId)
                .performedAt(LocalDateTime.now())
                .isRolledBack(false)
                .build();
        auditRepository.save(audit);
    }
    
    private void rollbackModeratorsAction(Audit audit) {
        // Реализуем ту же логику что и в AuditService.rollbackAction, но без проверок прав
        switch (audit.getActionType()) {
            case USER_BLOCK:
                userRepository.findById(audit.getTargetId()).ifPresent(user -> {
                    user.setIsBlocked(false);
                    userRepository.save(user);
                });
                break;

            case USER_UNBLOCK:
                userRepository.findById(audit.getTargetId()).ifPresent(user -> {
                    user.setIsBlocked(true);
                    userRepository.save(user);
                });
                break;
                
            case REVIEW_DELETE:
                reviewRepository.findById(audit.getTargetId()).ifPresent(review -> {
                    review.setIsDeleted(false);
                    reviewRepository.save(review);
                });
                break;

            case REVIEW_RESTORE:
                reviewRepository.findById(audit.getTargetId()).ifPresent(review -> {
                    review.setIsDeleted(true);
                    reviewRepository.save(review);
                });
                break;
                
            // Остальные типы действий модераторы обычно не выполняют
            default:
                // Не откатываем неизвестные действия
                break;
        }
        
        // Помечаем действие как откаченное
        audit.setIsRolledBack(true);
        audit.setRollbackAt(LocalDateTime.now());
        auditRepository.save(audit);
    }

    public Optional<AuthorDTO> getLinkedAuthor(Long userId) {
        return authorRepository.findByUserUserId(userId)
                .map(authorMapper::toDTO);
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

    public Page<UserDTO> searchUsers(String username, String role, String status, Pageable pageable) {
        // Если все фильтры пусты, возвращаем всех пользователей
        if ((username == null || username.trim().isEmpty()) && 
            (role == null || role.isEmpty()) && 
            (status == null || status.isEmpty())) {
            return getAllUsers(pageable);
        }
        
        // Преобразуем строку роли в enum
        UserRole roleEnum = null;
        if (role != null && !role.isEmpty()) {
            try {
                roleEnum = UserRole.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Если роль неверная, игнорируем фильтр
                roleEnum = null;
            }
        }
        
        return userRepository.searchUsersWithFilters(username, role, roleEnum, status, pageable)
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
                .filter(user -> user.getIsBlocked() != null && user.getIsBlocked())
                .collect(Collectors.toList()),
            users.getPageable(),
            users.getTotalElements()
        );
    }

    public Page<UserDTO> filterActive(Page<UserDTO> users) {
        return new PageImpl<>(
            users.getContent().stream()
                .filter(user -> user.getIsBlocked() == null || !user.getIsBlocked())
                .collect(Collectors.toList()),
            users.getPageable(),
            users.getTotalElements()
        );
    }

    public List<UserDTO> getAllModerators() {
        return userRepository.findByRights(UserRole.MODERATOR, Pageable.unpaged())
                .stream()
                .map(userMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Получить всех пользователей, которые когда-либо выполняли действия в системе (есть в аудите)
     */
    public List<UserDTO> getAllUsersFromAudit() {
        // Получаем всех уникальных пользователей из аудита
        List<User> auditUsers = auditRepository.findAll()
                .stream()
                .map(Audit::getModerator)
                .filter(user -> user != null)
                .distinct()
                .sorted((u1, u2) -> u1.getUsername().compareToIgnoreCase(u2.getUsername()))
                .collect(Collectors.toList());
        
        return auditUsers.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
}