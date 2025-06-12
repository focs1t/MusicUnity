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
import ru.musicunity.backend.dto.UserRatingDTO;
import ru.musicunity.backend.dto.UserUpdateDTO;
import ru.musicunity.backend.dto.PasswordUpdateDTO;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.service.UserService;
import ru.musicunity.backend.mapper.UserMapper;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Tag(name = "User", description = "API для работы с пользователями")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;

    @Operation(summary = "Получение топ-100 пользователей")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Список топ-100 пользователей")
    })
    @GetMapping("/top-100")
    public ResponseEntity<List<UserRatingDTO>> getTop100Users() {
        return ResponseEntity.ok(userService.getTop100Users());
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

    @Operation(summary = "Обновление пароля пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Пароль успешно обновлен"),
        @ApiResponse(responseCode = "400", description = "Неверный текущий пароль")
    })
    @PatchMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateOwnPassword(@RequestBody PasswordUpdateDTO passwordUpdateDTO) {
        userService.updateOwnPassword(
            passwordUpdateDTO.getCurrentPassword(), 
            passwordUpdateDTO.getNewPassword()
        );
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Обновление данных пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Данные успешно обновлены")
    })
    @PatchMapping("/data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateOwnData(@RequestBody UserUpdateDTO userUpdateDTO) {
        userService.updateOwnData(
            userUpdateDTO.getBio(), 
            userUpdateDTO.getAvatarUrl(), 
            userUpdateDTO.getTelegramChatId()
        );
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

    @Operation(summary = "Получение текущего пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Текущий пользователь найден"),
        @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован")
    })
    @GetMapping("/current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userMapper.toDTO(userService.getCurrentUser()));
    }

    @Operation(summary = "Проверка статуса текущего пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Статус пользователя получен"),
        @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован"),
        @ApiResponse(responseCode = "403", description = "Пользователь заблокирован")
    })
    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> getUserStatus() {
        var currentUser = userService.getCurrentUser();
        Map<String, Boolean> response = new HashMap<>();
        response.put("isActive", currentUser.getIsBlocked() == null || !currentUser.getIsBlocked());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получение привязанного автора для пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Автор найден"),
        @ApiResponse(responseCode = "404", description = "Автор не найден")
    })
    @GetMapping("/{userId}/linked-author")
    public ResponseEntity<AuthorDTO> getLinkedAuthor(
        @Parameter(description = "ID пользователя") @PathVariable Long userId) {
        return userService.getLinkedAuthor(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 