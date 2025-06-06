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
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.service.UserService;

import java.util.List;

@Tag(name = "User", description = "API для работы с пользователями")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @Operation(summary = "Поиск пользователя по имени пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Пользователь найден"),
        @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> findByUsername(
        @Parameter(description = "Имя пользователя") @PathVariable String username) {
        UserDTO user = userService.findByUsername(username);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Поиск пользователей по имени пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список пользователей")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<UserDTO>> searchUsersByUsername(
        @Parameter(description = "Имя пользователя для поиска") @RequestParam String username,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsersByUsername(username, pageable));
    }

    @Operation(summary = "Получение пользователя по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Пользователь найден"),
        @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(
        @Parameter(description = "ID пользователя") @PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @Operation(summary = "Получение пользователей по роли")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список пользователей")
    })
    @GetMapping("/role/{role}")
    public ResponseEntity<Page<UserDTO>> findByRights(
        @Parameter(description = "Роль пользователя") @PathVariable UserRole role,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(userService.findByRights(role, pageable));
    }

    @Operation(summary = "Получение пользователей по роли")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список пользователей")
    })
    @GetMapping("/blocked")
    public ResponseEntity<Page<UserDTO>> findBlockedUsers(
            @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(userService.findBlockedUsers(pageable));
    }

    @Operation(summary = "Обновление пароля пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Пароль успешно обновлен"),
        @ApiResponse(responseCode = "400", description = "Неверный текущий пароль")
    })
    @PatchMapping("/password")
    public ResponseEntity<Void> updateOwnPassword(
        @Parameter(description = "Текущий пароль") @RequestParam String currentPassword,
        @Parameter(description = "Новый пароль") @RequestParam String newPassword) {
        userService.updateOwnPassword(currentPassword, newPassword);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Обновление данных пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Данные успешно обновлены")
    })
    @PatchMapping("/data")
    public ResponseEntity<Void> updateOwnData(
        @Parameter(description = "Биография пользователя") @RequestParam(required = false) String bio,
        @Parameter(description = "URL аватара") @RequestParam(required = false) String avatarUrl) {
        userService.updateOwnData(bio, avatarUrl);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Блокировка пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Пользователь заблокирован"),
        @ApiResponse(responseCode = "403", description = "Нет прав для блокировки"),
        @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @PatchMapping("/{id}/ban")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> banUser(
        @Parameter(description = "ID пользователя") @PathVariable Long id) {
        userService.banUser(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Разблокировка пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Пользователь разблокирован"),
            @ApiResponse(responseCode = "403", description = "Нет прав для разблокировки"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @PatchMapping("/{id}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unbanUser(
            @Parameter(description = "ID пользователя") @PathVariable Long id) {
        userService.unbanUser(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Получение избранных релизов пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список избранных релизов")
    })
    @GetMapping("/{userId}/favorites")
    public ResponseEntity<Page<ReleaseDTO>> getFavoriteReleases(
        @Parameter(description = "ID пользователя") @PathVariable Long userId,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(userService.getFavoriteReleases(userId, pageable));
    }

    @Operation(summary = "Получение отслеживаемых авторов пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список отслеживаемых авторов")
    })
    @GetMapping("/{userId}/followed-authors")
    public ResponseEntity<Page<AuthorDTO>> getFollowedAuthors(
        @Parameter(description = "ID пользователя") @PathVariable Long userId,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowedAuthors(userId, pageable));
    }

    @Operation(summary = "Получение релизов от отслеживаемых авторов")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список релизов")
    })
    @GetMapping("/{userId}/followed-authors/releases")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesFromFollowedAuthors(
        @Parameter(description = "ID пользователя") @PathVariable Long userId,
        @Parameter(description = "Параметры пагинации") Pageable pageable) {
        return ResponseEntity.ok(userService.getReleasesFromFollowedAuthors(userId, pageable));
    }
} 