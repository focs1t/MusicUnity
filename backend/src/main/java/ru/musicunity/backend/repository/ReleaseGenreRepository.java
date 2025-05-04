package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.ReleaseGenre;

import java.util.List;

@Repository
public interface ReleaseGenreRepository extends JpaRepository<ReleaseGenre, ReleaseGenre.ReleaseGenreId> {
    @Query("SELECT * FROM ReleaseGenre rg WHERE rg.releaseId = :releaseId")
    List<ReleaseGenre> findByRelease(Long releaseId);

    @Query("SELECT * FROM ReleaseGenre rg WHERE rg.genreId = :genreId")
    List<ReleaseGenre> findByGenre(Long genreId);
}