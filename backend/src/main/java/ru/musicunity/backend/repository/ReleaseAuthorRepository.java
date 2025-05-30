package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.ReleaseAuthor;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReleaseAuthorRepository extends JpaRepository<ReleaseAuthor, ReleaseAuthor.ReleaseAuthorId> {
    @Query("SELECT ra FROM ReleaseAuthor ra WHERE ra.release.releaseId = :releaseId AND ra.author.authorId = :authorId")
    Optional<ReleaseAuthor> findByReleaseIdAndAuthorId(@Param("releaseId") Long releaseId, @Param("authorId") Long authorId);
}