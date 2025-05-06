package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Genre;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {
}