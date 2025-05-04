package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Author;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {
    @Query("SELECT * FROM Author a WHERE a.isVerified = true")
    List<Author> findVerifiedAuthors();

    @Query("SELECT * FROM Author a JOIN a.releases r GROUP BY a ORDER BY COUNT(r) DESC")
    Page<Author> findPopularAuthors(Pageable pageable);

    @Query("SELECT * FROM Author a JOIN a.user u WHERE u.userId = :userId")
    Optional<Author> findByUserId(Long userId);

    @Query("SELECT * FROM Author a WHERE LOWER(a.authorName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Author> searchAuthors(String query, Pageable pageable);
}