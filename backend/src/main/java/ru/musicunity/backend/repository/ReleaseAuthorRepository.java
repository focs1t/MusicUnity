package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.ReleaseAuthor;

import java.util.List;

@Repository
public interface ReleaseAuthorRepository extends JpaRepository<ReleaseAuthor, ReleaseAuthor.ReleaseAuthorId> {
    @Query("SELECT ra FROM ReleaseAuthor ra WHERE ra.release.id = :releaseId")
    List<ReleaseAuthor> findByRelease(Long releaseId);

    @Query("SELECT ra FROM ReleaseAuthor ra WHERE ra.author.id = :authorId")
    List<ReleaseAuthor> findByAuthor(Long authorId);
}