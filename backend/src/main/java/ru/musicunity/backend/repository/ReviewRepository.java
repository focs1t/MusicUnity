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
}