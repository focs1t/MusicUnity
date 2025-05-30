package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.GenreDTO;
import ru.musicunity.backend.exception.GenreNotFoundException;
import ru.musicunity.backend.mapper.GenreMapper;
import ru.musicunity.backend.pojo.Genre;
import ru.musicunity.backend.repository.GenreRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GenreService {
    private final GenreRepository genreRepository;
    private final GenreMapper genreMapper;

    public Page<GenreDTO> getAllGenres(Pageable pageable) {
        return genreRepository.findAll(pageable)
                .map(genreMapper::toDTO);
    }

    public GenreDTO getGenreById(Long id) {
        return genreRepository.findById(id)
                .map(genreMapper::toDTO)
                .orElseThrow(() -> new GenreNotFoundException(id));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public GenreDTO createGenre(String name) {
        Genre genre = Genre.builder()
                .name(name)
                .build();
        return genreMapper.toDTO(genreRepository.save(genre));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void deleteGenre(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new GenreNotFoundException(id));
        genreRepository.delete(genre);
    }
}
