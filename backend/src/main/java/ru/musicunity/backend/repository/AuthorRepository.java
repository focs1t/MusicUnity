package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Author;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {
    Optional<Author> findByAuthorName(String authorName);

    Optional<Author> findByUserUserId(Long userId);

    Page<Author> findByIsArtistTrue(Pageable pageable);

    Page<Author> findByIsProducerTrue(Pageable pageable);

    @Query(value = "SELECT a FROM Author a",
           countQuery = "SELECT COUNT(a) FROM Author a")
    Page<Author> findAllSorted(Pageable pageable);

    @Query("SELECT a FROM Author a WHERE LOWER(a.authorName) LIKE LOWER(CONCAT('%', :authorName, '%'))")
    Page<Author> findByAuthorNameContainingIgnoreCase(String authorName, Pageable pageable);

    @Query("SELECT a FROM Author a JOIN a.followings f WHERE f.user.userId = :userId")
    Page<Author> findByFollowingsUserUserId(@Param("userId") Long userId, Pageable pageable);
}