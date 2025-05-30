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

    @Query(value = "SELECT r FROM Release r",
           countQuery = "SELECT COUNT(r) FROM Release r")
    Page<Release> findAllSorted(Pageable pageable);
    
    @Query(value = "SELECT DISTINCT r FROM Release r JOIN r.authors ra WHERE ra.author.authorId = :authorId",
           countQuery = "SELECT COUNT(DISTINCT r) FROM Release r JOIN r.authors ra WHERE ra.author.authorId = :authorId")
    Page<Release> findByAuthorId(@Param("authorId") Long authorId, Pageable pageable);

    Page<Release> findByFavoritesUserUserId(Long userId, Pageable pageable);

    @Query("SELECT DISTINCT r FROM Release r " +
           "JOIN r.authors ra " +
           "WHERE ra.author IN :authors ")
    Page<Release> findByAuthors(@Param("authors") List<Author> authors, Pageable pageable);
}