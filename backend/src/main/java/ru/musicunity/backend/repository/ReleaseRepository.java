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
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReleaseRepository extends JpaRepository<Release, Long>, JpaSpecificationExecutor<Release> {

    @Query(value = "SELECT r FROM Release r WHERE r.isDeleted = false",
           countQuery = "SELECT COUNT(r) FROM Release r WHERE r.isDeleted = false")
    Page<Release> findAllSorted(Pageable pageable);
    
    @Query(value = "SELECT DISTINCT r FROM Release r JOIN r.authors ra WHERE ra.author.authorId = :authorId AND r.isDeleted = false",
           countQuery = "SELECT COUNT(DISTINCT r) FROM Release r JOIN r.authors ra WHERE ra.author.authorId = :authorId AND r.isDeleted = false")
    Page<Release> findByAuthorId(@Param("authorId") Long authorId, Pageable pageable);

    @Query("SELECT r FROM Release r WHERE r.isDeleted = true")
    Page<Release> findAllDeleted(Pageable pageable);

    Page<Release> findByFavoritesUserUserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    @Query("SELECT DISTINCT r FROM Release r " +
           "JOIN r.authors ra " +
           "WHERE ra.author IN :authors AND r.isDeleted = false AND ra.author.isDeleted = false")
    Page<Release> findByAuthors(@Param("authors") List<Author> authors, Pageable pageable);

    /**
     * Получение топ релизов по среднему рейтингу без фильтрации по дате
     */
    @Query("SELECT r FROM Release r " +
           "WHERE r.isDeleted = false " +
           "AND EXISTS (SELECT rv FROM Review rv WHERE rv.release = r AND rv.totalScore IS NOT NULL) " +
           "ORDER BY (" +
           "   SELECT AVG(CAST(rv.totalScore AS double)) " +
           "   FROM Review rv " +
           "   WHERE rv.release = r AND rv.totalScore IS NOT NULL" +
           ") DESC")
    Page<Release> findTopRatedReleasesWithoutDate(Pageable pageable);

    /**
     * Получение топ релизов по среднему рейтингу с фильтрацией по типу
     */
    @Query("SELECT r FROM Release r " +
           "WHERE r.isDeleted = false " +
           "AND r.type = :releaseType " +
           "AND EXISTS (SELECT rv FROM Review rv WHERE rv.release = r AND rv.totalScore IS NOT NULL) " +
           "ORDER BY (" +
           "   SELECT AVG(CAST(rv.totalScore AS double)) " +
           "   FROM Review rv " +
           "   WHERE rv.release = r AND rv.totalScore IS NOT NULL" +
           ") DESC")
    Page<Release> findTopRatedReleasesByTypeOnly(
        @Param("releaseType") ReleaseType releaseType,
        Pageable pageable
    );

    /**
     * Получение топ релизов по среднему рейтингу с фильтрацией по дате
     */
    @Query("SELECT r FROM Release r " +
           "WHERE r.isDeleted = false " +
           "AND r.releaseDate >= :startDate " +
           "AND r.releaseDate <= :endDate " +
           "AND EXISTS (SELECT rv FROM Review rv WHERE rv.release = r AND rv.totalScore IS NOT NULL) " +
           "ORDER BY (" +
           "   SELECT AVG(CAST(rv.totalScore AS double)) " +
           "   FROM Review rv " +
           "   WHERE rv.release = r AND rv.totalScore IS NOT NULL" +
           ") DESC")
    Page<Release> findTopRatedReleasesWithDate(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );

    /**
     * Получение топ релизов по среднему рейтингу с полной фильтрацией
     */
    @Query("SELECT r FROM Release r " +
           "WHERE r.isDeleted = false " +
           "AND r.type = :releaseType " +
           "AND r.releaseDate >= :startDate " +
           "AND r.releaseDate <= :endDate " +
           "AND EXISTS (SELECT rv FROM Review rv WHERE rv.release = r AND rv.totalScore IS NOT NULL) " +
           "ORDER BY (" +
           "   SELECT AVG(CAST(rv.totalScore AS double)) " +
           "   FROM Review rv " +
           "   WHERE rv.release = r AND rv.totalScore IS NOT NULL" +
           ") DESC")
    Page<Release> findTopRatedReleasesWithTypeAndDate(
        @Param("releaseType") ReleaseType releaseType,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );

    /**
     * Получение топ релизов определенного типа по среднему рейтингу за указанный период
     */
    @Query("SELECT r FROM Release r " +
           "WHERE r.isDeleted = false " +
           "AND r.type = :releaseType " +
           "AND EXISTS (SELECT rv FROM Review rv WHERE rv.release = r AND rv.totalScore IS NOT NULL) " +
           "ORDER BY (" +
           "   SELECT AVG(CAST(rv.totalScore AS double)) " +
           "   FROM Review rv " +
           "   WHERE rv.release = r AND rv.totalScore IS NOT NULL" +
           ") DESC")
    Page<Release> findTopRatedReleasesByTypeWithoutDate(
        @Param("releaseType") ReleaseType releaseType,
        Pageable pageable
    );

    /**
     * Получение топ релизов определенного типа по среднему рейтингу за указанный период с датами
     */
    @Query("SELECT r FROM Release r " +
           "WHERE r.isDeleted = false " +
           "AND r.type = :releaseType " +
           "AND r.releaseDate >= :startDate " +
           "AND r.releaseDate <= :endDate " +
           "AND EXISTS (SELECT rv FROM Review rv WHERE rv.release = r AND rv.totalScore IS NOT NULL) " +
           "ORDER BY (" +
           "   SELECT AVG(CAST(rv.totalScore AS double)) " +
           "   FROM Review rv " +
           "   WHERE rv.release = r AND rv.totalScore IS NOT NULL" +
           ") DESC")
    Page<Release> findTopRatedReleasesByTypeWithDate(
        @Param("releaseType") ReleaseType releaseType,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );

    /**
     * Получение уникальных годов из дат релизов
     */
    @Query("SELECT DISTINCT YEAR(r.releaseDate) FROM Release r " +
           "WHERE r.isDeleted = false " +
           "ORDER BY YEAR(r.releaseDate) DESC")
    List<Integer> findDistinctYears();

    /**
     * Получение уникальных годов для определенного типа релизов
     */
    @Query("SELECT DISTINCT YEAR(r.releaseDate) FROM Release r " +
           "WHERE r.isDeleted = false " +
           "AND r.type = :releaseType " +
           "ORDER BY YEAR(r.releaseDate) DESC")
    List<Integer> findDistinctYearsByType(@Param("releaseType") ReleaseType releaseType);

    /**
     * Получение уникальных месяцев для определенного года
     */
    @Query("SELECT DISTINCT MONTH(r.releaseDate) FROM Release r " +
           "WHERE r.isDeleted = false " +
           "AND YEAR(r.releaseDate) = :year " +
           "ORDER BY MONTH(r.releaseDate)")
    List<Integer> findDistinctMonthsByYear(@Param("year") Integer year);

    /**
     * Получение уникальных месяцев для определенного года и типа релиза
     */
    @Query("SELECT DISTINCT MONTH(r.releaseDate) FROM Release r " +
           "WHERE r.isDeleted = false " +
           "AND YEAR(r.releaseDate) = :year " +
           "AND r.type = :releaseType " +
           "ORDER BY MONTH(r.releaseDate)")
    List<Integer> findDistinctMonthsByYearAndType(@Param("year") Integer year, @Param("releaseType") ReleaseType releaseType);

    /**
     * Поиск релизов по названию и автору
     */
    @Query("SELECT DISTINCT r FROM Release r " +
           "LEFT JOIN r.authors ra " +
           "WHERE r.isDeleted = false " +
           "AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(ra.author.authorName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY r.releaseDate DESC")
    Page<Release> findByTitleContainingIgnoreCase(@Param("search") String search, Pageable pageable);
}