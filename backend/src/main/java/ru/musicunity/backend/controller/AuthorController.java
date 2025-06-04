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
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.service.AuthorService;
import ru.musicunity.backend.service.AuthorFollowingService;
import ru.musicunity.backend.service.ReleaseService;
import ru.musicunity.backend.service.UserService;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.mapper.AuthorMapper;

import java.util.Optional;

@Tag(name = "Authors", description = "API для работы с авторами")
@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {
    private final AuthorService authorService;
    private final AuthorFollowingService authorFollowingService;
    private final UserService userService;
    private final UserMapper userMapper;
    private final AuthorMapper authorMapper;
    private final ReleaseService releaseService;

    @Operation(summary = "Получение всех авторов")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список авторов")
    })
    @GetMapping
    public ResponseEntity<Page<AuthorDTO>> getAllAuthors(
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(authorService.findAllSorted(pageable));
    }

    @Operation(summary = "Поиск авторов по имени")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список найденных авторов")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<AuthorDTO>> searchAuthors(
        @Parameter(description = "Имя автора для поиска") @RequestParam String name,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(authorService.searchAuthorsByName(name, pageable));
    }

    @Operation(summary = "Получение автора по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Автор найден"),
        @ApiResponse(responseCode = "404", description = "Автор не найден")
    })
    @GetMapping("/{id}")
    public ResponseEntity<AuthorDTO> getAuthorById(
        @Parameter(description = "ID автора") @PathVariable Long id) {
        return ResponseEntity.ok(authorService.getAuthorById(id));
    }

    @Operation(summary = "Обновление данных автора")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Данные автора обновлены"),
        @ApiResponse(responseCode = "403", description = "Нет прав для обновления"),
        @ApiResponse(responseCode = "404", description = "Автор не найден")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<AuthorDTO> updateAuthor(
        @Parameter(description = "ID автора") @PathVariable Long id,
        @Parameter(description = "Обновляемые поля автора") @RequestBody AuthorDTO updatedAuthor) {
        return ResponseEntity.ok(authorService.updateAuthor(id, updatedAuthor));
    }

    @Operation(summary = "Создание нового автора")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Автор успешно создан"),
        @ApiResponse(responseCode = "403", description = "Нет прав для создания автора")
    })
    @PostMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<AuthorDTO> createAuthor(
        @Parameter(description = "Имя автора") @RequestParam String authorName,
        @Parameter(description = "Является ли исполнителем") @RequestParam Boolean isArtist,
        @Parameter(description = "Является ли продюсером") @RequestParam Boolean isProducer) {
        return ResponseEntity.ok(authorService.createAuthor(
                authorName,
                isArtist,
                isProducer));
    }

    @Operation(summary = "Получение отслеживаемых авторов")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список отслеживаемых авторов"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @GetMapping("/followed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<AuthorDTO>> getFollowedAuthors(
        @Parameter(description = "ID пользователя") @RequestParam Long userId,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(authorFollowingService.getFollowedAuthors(
                userMapper.toEntity(userService.getUserById(userId)),
                pageable));
    }

    @Operation(summary = "Получение исполнителей")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список исполнителей"),
            @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @GetMapping("/artists")
    public ResponseEntity<Page<AuthorDTO>> getArtists(
            @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(authorService.findArtists(pageable));
    }

    @Operation(summary = "Получение продюсеров")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список продюсеров"),
            @ApiResponse(responseCode = "401", description = "Требуется авторизация")
    })
    @GetMapping("/producers")
    public ResponseEntity<Page<AuthorDTO>> getProducers(
            @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(authorService.findProducers(pageable));
    }

    @Operation(summary = "Подписка на автора")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Успешная подписка"),
        @ApiResponse(responseCode = "401", description = "Требуется авторизация"),
        @ApiResponse(responseCode = "404", description = "Автор не найден")
    })
    @PostMapping("/{authorId}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> followAuthor(
            @Parameter(description = "ID автора") @PathVariable Long authorId) {
        authorFollowingService.followAuthor(authorId, userService.getCurrentUser().getUserId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{authorId}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unfollowAuthor(
            @PathVariable Long authorId,
            @RequestParam Long userId) {
        authorFollowingService.unfollowAuthor(authorId, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Мягкое удаление автора (только для модераторов)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Автор успешно помечен как удаленный"),
        @ApiResponse(responseCode = "403", description = "Нет прав для удаления автора"),
        @ApiResponse(responseCode = "404", description = "Автор не найден")
    })
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> softDeleteAuthor(
        @Parameter(description = "ID автора") @PathVariable Long id) {
        authorService.softDeleteAuthor(id);
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
} 