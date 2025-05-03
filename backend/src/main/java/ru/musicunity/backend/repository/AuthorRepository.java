package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Author;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {
    Optional<Author> findByAuthorName(String authorName);

    @Query("SELECT a FROM Author a WHERE a.isVerified = true")
    List<Author> findAllVerified();

    @Query("SELECT a FROM Author a JOIN a.user u WHERE u.userId = :userId")
    Optional<Author> findByUserId(Long userId);
}