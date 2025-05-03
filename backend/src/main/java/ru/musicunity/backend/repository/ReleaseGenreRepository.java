package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.ReleaseGenre;

import java.util.List;

@Repository
public interface ReleaseGenreRepository extends JpaRepository<ReleaseGenre, ReleaseGenre.ReleaseGenreId> {
    @Query("SELECT rg FROM ReleaseGenre rg WHERE rg.release.releaseId = :releaseId")
    List<ReleaseGenre> findByReleaseId(Long releaseId);

    @Modifying
    @Query("DELETE FROM ReleaseGenre rg WHERE rg.release.releaseId = :releaseId AND rg.genre.genreId = :genreId")
    void deleteByReleaseAndGenre(Long releaseId, Long genreId);
}