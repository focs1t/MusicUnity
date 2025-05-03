package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.ReleaseAuthor;

import java.util.List;

@Repository
public interface ReleaseAuthorRepository extends JpaRepository<ReleaseAuthor, ReleaseAuthor.ReleaseAuthorId> {
    @Query("SELECT ra FROM ReleaseAuthor ra WHERE ra.release.releaseId = :releaseId")
    List<ReleaseAuthor> findByReleaseId(Long releaseId);

    @Modifying
    @Query("DELETE FROM ReleaseAuthor ra WHERE ra.release.releaseId = :releaseId AND ra.author.authorId = :authorId")
    void deleteByReleaseAndAuthor(Long releaseId, Long authorId);
}