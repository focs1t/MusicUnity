package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.UserRole;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Базовые методы поиска
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndRights(String email, UserRole rights);
    Optional<User> findByTelegramChatId(Long chatId);
    
    // Поиск по ролям
    List<User> findByRights(UserRole rights);
    List<User> findByIsBlockedTrue();

    // Поиск пользователей по частичному совпадению имени
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);

    // Проверка существования пользователя
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    // Поиск пользователей по роли с пагинацией
    @Query("SELECT u FROM User u WHERE u.rights = :role")
    Page<User> findByRole(@Param("role") UserRole role, Pageable pageable);

    // Поиск пользователей по статусу блокировки с пагинацией
    @Query("SELECT u FROM User u WHERE u.isBlocked = :isBlocked")
    Page<User> findByBlockedStatus(@Param("isBlocked") boolean isBlocked, Pageable pageable);

    // Поиск пользователей по частичному совпадению имени (без пагинации)
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchByUsername(@Param("query") String query);
}