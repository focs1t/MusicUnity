package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Release;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReleaseRepository extends JpaRepository<Release, Long> {
    @Query("SELECT r FROM Release r JOIN r.authors a WHERE a.authorId = :authorId")
    List<Release> findByAuthorId(Long authorId);

    @Query("SELECT r FROM Release r JOIN r.genres g WHERE g.genreId = :genreId")
    List<Release> findByGenreId(Long genreId);

    @Query("SELECT r FROM Release r WHERE r.releaseDate BETWEEN :start AND :end")
    List<Release> findBetweenDates(LocalDate start, LocalDate end);
}