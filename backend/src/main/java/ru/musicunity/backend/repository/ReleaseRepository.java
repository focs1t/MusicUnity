package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.ReviewType;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReleaseRepository extends JpaRepository<Release, Long>, JpaSpecificationExecutor<Release> {

    Page<Release> findAllByOrderByAddedAtDesc(Pageable pageable);
    
    @Query(value = "SELECT DISTINCT r FROM Release r JOIN r.authors ra WHERE ra.author.authorId = :authorId",
           countQuery = "SELECT COUNT(DISTINCT r) FROM Release r JOIN r.authors ra WHERE ra.author.authorId = :authorId")
    Page<Release> findByAuthorId(@Param("authorId") Long authorId, Pageable pageable);
    
    @Query("SELECT r FROM Release r " +
           "JOIN r.authors ra " +
           "WHERE ra.author.authorId = :authorId " +
           "ORDER BY (SELECT AVG(rv.totalScore) FROM r.reviews rv WHERE rv.type = :reviewType) DESC")
    List<Release> findTop5ByAuthorsAuthorAuthorIdOrderByAverageRatingDesc(@Param("authorId") Long authorId, @Param("reviewType") ReviewType reviewType);
    
    @Query("SELECT r FROM Release r " +
           "WHERE EXISTS (SELECT rv FROM r.reviews rv WHERE rv.createdAt > :date) " +
           "ORDER BY (SELECT COUNT(rv) FROM r.reviews rv WHERE rv.createdAt > :date) DESC")
    List<Release> findTop15ByReviewsCreatedAtAfterOrderByReviewsCountDesc(@Param("date") LocalDateTime date);

    // Методы для работы с избранными релизами
    Page<Release> findByFavoritesUserUserId(Long userId, Pageable pageable);
    Page<Release> findByFavoritesUserUserIdAndType(Long userId, ReleaseType type, Pageable pageable);

    // Методы для работы с релизами от подписанных авторов
    @Query("SELECT DISTINCT r FROM Release r " +
           "JOIN r.authors ra " +
           "WHERE ra.author IN :authors " +
           "ORDER BY r.addedAt DESC")
    Page<Release> findByAuthorsInAndOrderByAddedAtDesc(@Param("authors") List<Author> authors, Pageable pageable);

    @Query("SELECT DISTINCT r FROM Release r " +
           "JOIN r.authors ra " +
           "WHERE ra.author IN :authors AND r.type = :type " +
           "ORDER BY r.addedAt DESC")
    Page<Release> findByAuthorsInAndTypeOrderByAddedAtDesc(@Param("authors") List<Author> authors, @Param("type") ReleaseType type, Pageable pageable);
}