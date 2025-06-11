package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.enums.ReviewType;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findAllByReleaseReleaseIdAndIsDeletedFalse(Long releaseId, Pageable pageable);

    Page<Review> findAllByUserUserIdAndIsDeletedFalse(Long userId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.userId = :userId AND r.isDeleted = false")
    long countByUser(Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.release.releaseId = :releaseId AND r.isDeleted = false")
    long countByRelease(Long releaseId);

    @Query("SELECT r FROM Review r WHERE r.isDeleted = false AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.EXTENDED")
    Page<Review> findAllSorted(Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.isDeleted = true")
    Page<Review> findAllDeleted(Pageable pageable);

    /**
     * Поиск рецензий, которые лайкнул пользователь
     * @param userId ID пользователя
     * @param pageable параметры пагинации
     * @return страница рецензий
     */
    @Query("SELECT r FROM Review r JOIN Like l ON l.review.reviewId = r.reviewId WHERE l.user.userId = :userId")
    Page<Review> findLikedByUser(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Подсчет количества рецензий определенного типа по релизу
     * @param releaseId ID релиза
     * @param type тип рецензии
     * @return количество рецензий
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = :type AND r.isDeleted = false")
    long countByReleaseAndType(@Param("releaseId") Long releaseId, @Param("type") ReviewType type);
    
    /**
     * Подсчет количества рецензий определенного типа, созданных пользователем
     * @param userId ID пользователя
     * @param type тип рецензии
     * @return количество рецензий
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.userId = :userId AND r.type = :type AND r.isDeleted = false")
    long countByUserAndType(@Param("userId") Long userId, @Param("type") ReviewType type);
    
    /**
     * Получение всех рецензий определенного типа по релизу
     * @param releaseId ID релиза
     * @param type тип рецензии
     * @param pageable параметры пагинации
     * @return страница рецензий
     */
    Page<Review> findAllByReleaseReleaseIdAndTypeAndIsDeletedFalse(Long releaseId, ReviewType type, Pageable pageable);
    
    /**
     * Получение всех рецензий определенного типа, созданных пользователем
     * @param userId ID пользователя
     * @param type тип рецензии
     * @param pageable параметры пагинации
     * @return страница рецензий
     */
    Page<Review> findAllByUserUserIdAndTypeAndIsDeletedFalse(Long userId, ReviewType type, Pageable pageable);
    
    /**
     * Получение средней оценки по рифме и образности для расширенных рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.rhymeImagery) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.EXTENDED AND r.isDeleted = false AND r.rhymeImagery IS NOT NULL")
    Double getAverageRhymeImageryByReleaseAndTypeExtended(@Param("releaseId") Long releaseId);
    
    /**
     * Получение средней оценки по структуре и ритму для расширенных рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.structureRhythm) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.EXTENDED AND r.isDeleted = false AND r.structureRhythm IS NOT NULL")
    Double getAverageStructureRhythmByReleaseAndTypeExtended(@Param("releaseId") Long releaseId);
    
    /**
     * Получение средней оценки по стилю и исполнению для расширенных рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.styleExecution) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.EXTENDED AND r.isDeleted = false AND r.styleExecution IS NOT NULL")
    Double getAverageStyleExecutionByReleaseAndTypeExtended(@Param("releaseId") Long releaseId);
    
    /**
     * Получение средней оценки по индивидуальности для расширенных рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.individuality) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.EXTENDED AND r.isDeleted = false AND r.individuality IS NOT NULL")
    Double getAverageIndividualityByReleaseAndTypeExtended(@Param("releaseId") Long releaseId);
    
    /**
     * Получение средней оценки по вайбу для расширенных рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.vibe) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.EXTENDED AND r.isDeleted = false AND r.vibe IS NOT NULL")
    Double getAverageVibeByReleaseAndTypeExtended(@Param("releaseId") Long releaseId);
    
    /**
     * Получение средней оценки по рифме и образности для простых рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.rhymeImagery) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.SIMPLE AND r.isDeleted = false AND r.rhymeImagery IS NOT NULL")
    Double getAverageRhymeImageryByReleaseAndTypeSimple(@Param("releaseId") Long releaseId);
    
    /**
     * Получение средней оценки по структуре и ритму для простых рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.structureRhythm) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.SIMPLE AND r.isDeleted = false AND r.structureRhythm IS NOT NULL")
    Double getAverageStructureRhythmByReleaseAndTypeSimple(@Param("releaseId") Long releaseId);
    
    /**
     * Получение средней оценки по стилю и исполнению для простых рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.styleExecution) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.SIMPLE AND r.isDeleted = false AND r.styleExecution IS NOT NULL")
    Double getAverageStyleExecutionByReleaseAndTypeSimple(@Param("releaseId") Long releaseId);
    
    /**
     * Получение средней оценки по индивидуальности для простых рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.individuality) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.SIMPLE AND r.isDeleted = false AND r.individuality IS NOT NULL")
    Double getAverageIndividualityByReleaseAndTypeSimple(@Param("releaseId") Long releaseId);
    
    /**
     * Получение средней оценки по вайбу для простых рецензий релиза
     * @param releaseId ID релиза
     * @return средняя оценка или null
     */
    @Query("SELECT AVG(r.vibe) FROM Review r WHERE r.release.releaseId = :releaseId AND r.type = ru.musicunity.backend.pojo.enums.ReviewType.SIMPLE AND r.isDeleted = false AND r.vibe IS NOT NULL")
    Double getAverageVibeByReleaseAndTypeSimple(@Param("releaseId") Long releaseId);
}