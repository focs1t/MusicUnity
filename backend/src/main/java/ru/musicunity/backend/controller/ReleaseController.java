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
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.service.FavoriteService;
import ru.musicunity.backend.service.ReleaseService;
import ru.musicunity.backend.service.UserService;
import ru.musicunity.backend.service.FollowedReleasesService;
import ru.musicunity.backend.mapper.UserMapper;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/releases")
@RequiredArgsConstructor
@Tag(name = "Релизы", description = "API для управления музыкальными релизами")
public class ReleaseController {
    private final ReleaseService releaseService;
    private final FavoriteService favoriteService;
    private final UserService userService;
    private final FollowedReleasesService followedReleasesService;
    private final UserMapper userMapper;

    @Operation(summary = "Получение релиза по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз найден"),
        @ApiResponse(responseCode = "404", description = "Релиз не найден")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ReleaseDTO> getReleaseById(
        @Parameter(description = "ID релиза") @PathVariable Long id) {
        return ResponseEntity.ok(releaseService.getReleaseById(id));
    }

    @Operation(summary = "Получение новых релизов")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список новых релизов")
    })
    @GetMapping("/new")
    public ResponseEntity<Page<ReleaseDTO>> getNewReleases(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(releaseService.getNewReleases(pageable));
    }

    @Operation(summary = "Получение релизов автора")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список релизов автора")
    })
    @GetMapping("/author/{authorId}")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesByAuthor(
        @Parameter(description = "ID автора") @PathVariable Long authorId,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(releaseService.getReleasesByAuthor(authorId, pageable));
    }

    @Operation(summary = "Получение топ релизов автора")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список топ релизов автора")
    })
    @GetMapping("/author/{authorId}/top")
    public ResponseEntity<Page<ReleaseDTO>> getTopReleasesByAuthor(
        @Parameter(description = "ID автора") @PathVariable Long authorId) {
        return ResponseEntity.ok(Page.empty());
    }

    @Operation(summary = "Получение топ релизов по отзывам")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список топ релизов")
    })
    @GetMapping("/top")
    public ResponseEntity<Page<ReleaseDTO>> getTopReleasesByReviews() {
        return ResponseEntity.ok(Page.empty());
    }

    @Operation(summary = "Создание нового релиза")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз успешно создан"),
        @ApiResponse(responseCode = "403", description = "Нет прав для создания релиза")
    })
    @PostMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReleaseDTO> createRelease(
        @Parameter(description = "Данные релиза") @RequestBody ReleaseDTO releaseDTO) {
        return ResponseEntity.ok(releaseService.createRelease(
                releaseDTO.getTitle(),
                releaseDTO.getType(),
                releaseDTO.getReleaseDate(),
                releaseDTO.getCoverUrl(),
                releaseDTO.getReleaseLink(),
                releaseDTO.getProducerNames(),
                releaseDTO.getArtistNames(),
                releaseDTO.getProducerIds(),
                releaseDTO.getArtistIds(),
                releaseDTO.getGenreIds()
        ));
    }

    @Operation(summary = "Создание собственного релиза")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз успешно создан"),
        @ApiResponse(responseCode = "403", description = "Нет прав для создания релиза")
    })
    @PostMapping("/own")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ReleaseDTO> createOwnRelease(
        @Parameter(description = "Данные релиза") @RequestBody ReleaseDTO releaseDTO) {
        return ResponseEntity.ok(releaseService.createOwnRelease(
                releaseDTO.getTitle(),
                releaseDTO.getType(),
                releaseDTO.getReleaseDate(),
                releaseDTO.getCoverUrl(),
                releaseDTO.getReleaseLink(),
                releaseDTO.getProducerNames(),
                releaseDTO.getArtistNames(),
                releaseDTO.getProducerIds(),
                releaseDTO.getArtistIds(),
                releaseDTO.getGenreIds(),
                releaseDTO.getUserId()
        ));
    }

    @Operation(summary = "Получение избранных релизов")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список избранных релизов"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @GetMapping("/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getFavoriteReleases(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(favoriteService.getFavoriteReleasesByUser(releaseService.getCurrentUser(), pageable));
    }

    @Operation(summary = "Получение избранных релизов по типу")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список избранных релизов"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @GetMapping("/favorites/{type}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getFavoriteReleasesByType(
        @Parameter(description = "Тип релиза") @PathVariable ReleaseType type,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(favoriteService.getFavoriteReleasesByUserAndType(releaseService.getCurrentUser(), type, pageable));
    }

    @Operation(summary = "Добавление релиза в избранное")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз добавлен в избранное"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация"),
        @ApiResponse(responseCode = "404", description = "Релиз не найден")
    })
    @PostMapping("/{id}/favorite")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> addToFavorites(
        @Parameter(description = "ID релиза") @PathVariable Long id) {
        favoriteService.addToFavorites(id, releaseService.getCurrentUser().getUserId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Удаление релиза из избранного")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз удален из избранного"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация"),
        @ApiResponse(responseCode = "404", description = "Релиз не найден")
    })
    @DeleteMapping("/{id}/favorite")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeFromFavorites(
        @Parameter(description = "ID релиза") @PathVariable Long id) {
        favoriteService.removeFromFavorites(id, releaseService.getCurrentUser().getUserId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Получение релизов от отслеживаемых авторов")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список релизов"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @GetMapping("/followed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesByFollowedAuthors(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(followedReleasesService.getReleasesByFollowedAuthors(releaseService.getCurrentUser(), pageable));
    }

    @Operation(summary = "Получение релизов от отслеживаемых авторов по типу")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список релизов"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @GetMapping("/followed/{type}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesByFollowedAuthorsAndType(
        @Parameter(description = "Тип релиза") @PathVariable ReleaseType type,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(followedReleasesService.getReleasesByFollowedAuthorsAndType(releaseService.getCurrentUser(), type, pageable));
    }
}