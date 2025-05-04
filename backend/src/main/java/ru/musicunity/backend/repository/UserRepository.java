package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.rights = :role")
    List<User> findByRole(User.UserRole role);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> searchUsers(String query, Pageable pageable);

    // Топ 25 пользователей по количеству лайков на рецензиях
    @Query("SELECT u FROM User u LEFT JOIN u.reviews r GROUP BY u ORDER BY SUM(r.likesCount) DESC")
    Page<User> findTopUsersByReviewLikes(Pageable pageable);

    // Топ 3 пользователей по количеству рецензий
    @Query("SELECT u FROM User u LEFT JOIN u.reviews r GROUP BY u ORDER BY COUNT(r) DESC")
    Page<User> findTopUsersByReviewCount(Pageable pageable);
}