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
import org.springframework.web.server.ResponseStatusException;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.dto.CreateReleaseRequest;
import ru.musicunity.backend.dto.CreateOwnReleaseRequest;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.service.FavoriteService;
import ru.musicunity.backend.service.ReleaseService;
import ru.musicunity.backend.service.UserService;
import ru.musicunity.backend.service.FollowedReleasesService;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.exception.NoRoleSelectedException;
import ru.musicunity.backend.exception.UserNotInAuthorsException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

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

    @Operation(summary = "Создание нового релиза")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз успешно создан"),
        @ApiResponse(responseCode = "403", description = "Нет прав для создания релиза")
    })
    @PostMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReleaseDTO> createRelease(
        @Parameter(description = "Данные релиза") @RequestBody CreateReleaseRequest request) {
        return ResponseEntity.ok(releaseService.createRelease(request));
    }

    @Operation(summary = "Создание собственного релиза")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз успешно создан"),
        @ApiResponse(responseCode = "403", description = "Нет прав для создания релиза"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные релиза или не выбрана роль автора")
    })
    @PostMapping("/own")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ReleaseDTO> createOwnRelease(
        @Parameter(description = "Данные релиза") @RequestBody CreateOwnReleaseRequest request) {
        try {
            return ResponseEntity.ok(releaseService.createOwnRelease(request));
        } catch (NoRoleSelectedException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
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
        return ResponseEntity.ok(favoriteService.getFavoriteReleasesByUser(userService.getCurrentUser(), pageable));
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
        favoriteService.addToFavorites(id, userService.getCurrentUser().getUserId());
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
        favoriteService.removeFromFavorites(id, userService.getCurrentUser().getUserId());
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
        return ResponseEntity.ok(followedReleasesService.getReleasesByFollowedAuthors(userService.getCurrentUser(), pageable));
    }

    @Operation(summary = "Удаление автора из релиза")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Автор успешно удален"),
        @ApiResponse(responseCode = "403", description = "Нет прав для удаления автора"),
        @ApiResponse(responseCode = "404", description = "Релиз или автор не найден")
    })
    @DeleteMapping("/{releaseId}/authors/{authorId}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> removeAuthorFromRelease(
            @Parameter(description = "ID релиза") @PathVariable Long releaseId,
            @Parameter(description = "ID автора") @PathVariable Long authorId) {
        releaseService.removeAuthorFromRelease(releaseId, authorId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Обновление ролей автора в релизе")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Роли автора успешно обновлены"),
        @ApiResponse(responseCode = "403", description = "Нет прав для обновления ролей"),
        @ApiResponse(responseCode = "404", description = "Релиз или автор не найден")
    })
    @PatchMapping("/{releaseId}/authors/{authorId}/roles")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> updateAuthorRoles(
            @Parameter(description = "ID релиза") @PathVariable Long releaseId,
            @Parameter(description = "ID автора") @PathVariable Long authorId,
            @Parameter(description = "Роль автора") @RequestParam boolean isArtist,
            @Parameter(description = "Роль продюсера") @RequestParam boolean isProducer) {
        releaseService.updateAuthorRoles(releaseId, authorId, isArtist, isProducer);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Мягкое удаление релиза (только для модераторов)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз успешно помечен как удаленный"),
        @ApiResponse(responseCode = "403", description = "Нет прав для удаления релиза"),
        @ApiResponse(responseCode = "404", description = "Релиз не найден")
    })
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> softDeleteRelease(
        @Parameter(description = "ID релиза") @PathVariable Long id) {
        releaseService.softDeleteRelease(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Жесткое удаление релиза (только для администраторов)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз успешно удален"),
        @ApiResponse(responseCode = "403", description = "Нет прав для удаления релиза"),
        @ApiResponse(responseCode = "404", description = "Релиз не найден")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> hardDeleteRelease(
        @Parameter(description = "ID релиза") @PathVariable Long id) {
        releaseService.hardDeleteRelease(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Восстановление удаленного релиза (только для администраторов)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Релиз успешно восстановлен"),
        @ApiResponse(responseCode = "403", description = "Нет прав для восстановления релиза"),
        @ApiResponse(responseCode = "404", description = "Релиз не найден")
    })
    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restoreRelease(
        @Parameter(description = "ID релиза") @PathVariable Long id) {
        releaseService.restoreRelease(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Получение списка удаленных релизов (только для администраторов)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список удаленных релизов"),
        @ApiResponse(responseCode = "403", description = "Нет прав для просмотра удаленных релизов")
    })
    @GetMapping("/deleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReleaseDTO>> getDeletedReleases(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(releaseService.getAllDeletedReleases(pageable));
    }
}