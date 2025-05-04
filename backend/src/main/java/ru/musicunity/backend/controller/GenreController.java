package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.GenreDto;
import ru.musicunity.backend.service.GenreService;

import java.util.List;

@RestController
@RequestMapping("/genres")
@RequiredArgsConstructor
public class GenreController {
    private final GenreService genreService;

    @GetMapping
    public List<GenreDto> getAll() {
        return genreService.getAllGenres();
    }
} 