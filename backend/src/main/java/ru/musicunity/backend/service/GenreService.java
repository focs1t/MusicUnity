package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.dto.GenreDto;
import ru.musicunity.backend.repository.GenreRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreService {
    private final GenreRepository genreRepository;

    public List<GenreDto> getAllGenres() {
        return genreRepository.findAll().stream().map(g -> {
            GenreDto dto = new GenreDto();
            dto.setGenreId(g.getGenreId());
            dto.setName(g.getName());
            return dto;
        }).collect(Collectors.toList());
    }
}
