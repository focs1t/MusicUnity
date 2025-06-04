package ru.musicunity.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.GenreDTO;
import ru.musicunity.backend.service.GenreService;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
@Tag(name = "Жанры", description = "API для управления музыкальными жанрами")
public class GenreController {
    private final GenreService genreService;

    @Operation(summary = "Получение всех жанров")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список жанров")
    })
    @GetMapping
    public ResponseEntity<Page<GenreDTO>> getAllGenres(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(genreService.getAllGenres(pageable));
    }

    @Operation(summary = "Получение жанра по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Жанр найден"),
        @ApiResponse(responseCode = "404", description = "Жанр не найден")
    })
    @GetMapping("/{id}")
    public ResponseEntity<GenreDTO> getGenreById(
        @Parameter(description = "ID жанра") @PathVariable Long id) {
        return ResponseEntity.ok(genreService.getGenreById(id));
    }

    @Operation(summary = "Создание нового жанра")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Жанр успешно создан"),
        @ApiResponse(responseCode = "403", description = "Нет прав для создания жанра")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GenreDTO> createGenre(
        @Parameter(description = "Название жанра") @RequestParam String name) {
        return ResponseEntity.ok(genreService.createGenre(name));
    }

    @Operation(summary = "Удаление жанра")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Жанр успешно удален"),
        @ApiResponse(responseCode = "403", description = "Нет прав для удаления жанра"),
        @ApiResponse(responseCode = "404", description = "Жанр не найден")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGenre(
        @Parameter(description = "ID жанра") @PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.ok().build();
    }
} 