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
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.rights = :rights")
    Page<User> findByRights(@Param("rights") UserRole rights, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.isBlocked = true")
    Page<User> findByBlockedStatus(Pageable pageable);
}