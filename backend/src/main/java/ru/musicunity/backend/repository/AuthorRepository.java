package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.enums.AuthorRole;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {
    Optional<Author> findByAuthorName(String authorName);
    List<Author> findByRole(AuthorRole role);
    Page<Author> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Author> findByAuthorNameContainingIgnoreCase(String name, Pageable pageable);

    // Методы для работы с подписками
    @Query("SELECT a FROM Author a JOIN a.followings f WHERE f.user.userId = :userId")
    Page<Author> findByFollowingsUserUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT a FROM Author a JOIN a.followings f WHERE f.user.userId = :userId AND a.role = :role")
    Page<Author> findByFollowingsUserUserIdAndRole(@Param("userId") Long userId, @Param("role") AuthorRole role, Pageable pageable);
}