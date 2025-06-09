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
    @Query("SELECT a FROM Author a WHERE a.authorName = :authorName AND a.isDeleted = false")
    Optional<Author> findByAuthorName(@Param("authorName") String authorName);

    @Query("SELECT a FROM Author a WHERE a.user.userId = :userId AND a.isDeleted = false")
    Optional<Author> findByUserUserId(@Param("userId") Long userId);

    @Query("SELECT a FROM Author a WHERE a.isArtist = true AND a.isDeleted = false")
    Page<Author> findByIsArtistTrue(Pageable pageable);

    @Query("SELECT a FROM Author a WHERE a.isProducer = true AND a.isDeleted = false")
    Page<Author> findByIsProducerTrue(Pageable pageable);

    @Query("SELECT a FROM Author a WHERE a.isDeleted = false")
    Page<Author> findAllSorted(Pageable pageable);

    @Query("SELECT a FROM Author a WHERE LOWER(a.authorName) LIKE LOWER(CONCAT('%', :authorName, '%')) AND a.isDeleted = false")
    Page<Author> findByAuthorNameContainingIgnoreCase(@Param("authorName") String authorName, Pageable pageable);

    @Query("SELECT a FROM Author a WHERE a.isDeleted = false")
    Page<Author> findAllNotDeleted(Pageable pageable);

    @Query("SELECT a FROM Author a WHERE a.isDeleted = true")
    Page<Author> findAllDeleted(Pageable pageable);

    @Query("SELECT a FROM Author a JOIN a.followings f WHERE f.user.userId = :userId AND a.isDeleted = false")
    Page<Author> findByFollowingsUserUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT AVG(rv.totalScore) " +
           "FROM Author a JOIN a.releases ra JOIN ra.release r JOIN r.reviews rv " +
           "WHERE a.authorId = :authorId AND r.type = ru.musicunity.backend.pojo.enums.ReleaseType.ALBUM AND r.isDeleted = false AND rv.isDeleted = false AND rv.type = ru.musicunity.backend.pojo.enums.ReviewType.EXTENDED")
    Double findAverageAlbumExtendedRating(@Param("authorId") Long authorId);

    @Query("SELECT AVG(rv.totalScore) " +
           "FROM Author a JOIN a.releases ra JOIN ra.release r JOIN r.reviews rv " +
           "WHERE a.authorId = :authorId AND r.type = ru.musicunity.backend.pojo.enums.ReleaseType.ALBUM AND r.isDeleted = false AND rv.isDeleted = false AND rv.type = ru.musicunity.backend.pojo.enums.ReviewType.SIMPLE")
    Double findAverageAlbumSimpleRating(@Param("authorId") Long authorId);

    @Query("SELECT AVG(rv.totalScore) " +
           "FROM Author a JOIN a.releases ra JOIN ra.release r JOIN r.reviews rv " +
           "WHERE a.authorId = :authorId AND (r.type = ru.musicunity.backend.pojo.enums.ReleaseType.SINGLE OR r.type = ru.musicunity.backend.pojo.enums.ReleaseType.EP) AND r.isDeleted = false AND rv.isDeleted = false AND rv.type = ru.musicunity.backend.pojo.enums.ReviewType.EXTENDED")
    Double findAverageSingleEpExtendedRating(@Param("authorId") Long authorId);

    @Query("SELECT AVG(rv.totalScore) " +
           "FROM Author a JOIN a.releases ra JOIN ra.release r JOIN r.reviews rv " +
           "WHERE a.authorId = :authorId AND (r.type = ru.musicunity.backend.pojo.enums.ReleaseType.SINGLE OR r.type = ru.musicunity.backend.pojo.enums.ReleaseType.EP) AND r.isDeleted = false AND rv.isDeleted = false AND rv.type = ru.musicunity.backend.pojo.enums.ReviewType.SIMPLE")
    Double findAverageSingleEpSimpleRating(@Param("authorId") Long authorId);
}