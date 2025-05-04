package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Release;

import java.util.List;

@Repository
public interface ReleaseRepository extends JpaRepository<Release, Long>, JpaSpecificationExecutor<Release> {
    @Query("SELECT * FROM Release r JOIN r.authors a WHERE a.authorId = :authorId")
    Page<Release> findByAuthor(Long authorId, Pageable pageable);

    @Query("SELECT * FROM Release r JOIN r.genres g WHERE g.genreId = :genreId")
    Page<Release> findByGenre(Long genreId, Pageable pageable);

    @Query("SELECT * FROM Release r WHERE r.type = :type AND YEAR(r.releaseDate) = :year")
    Page<Release> findByTypeAndYear(Release.ReleaseType type, int year, Pageable pageable);

    @Query("SELECT * FROM Release r ORDER BY r.favoritesCount DESC")
    Page<Release> findTop15ByFavorites(Pageable pageable);

    @Query(value = "SELECT * FROM Release r JOIN r.authors a WHERE a.authorId = :authorId ORDER BY r.favoritesCount DESC LIMIT 5")
    List<Release> findTop5ByAuthorOrderByTotalScoreDesc(Long authorId);

    @Query("SELECT * FROM Release r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Release> searchReleases(String query, Pageable pageable);
}