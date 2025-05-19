package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.pojo.enums.AuthorRole;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> findByUsername(@PathVariable String username) {
        UserDTO user = userService.findByUsername(username);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/telegram/{chatId}")
    public ResponseEntity<UserDTO> findByTelegramChatId(@PathVariable Long chatId) {
        UserDTO user = userService.findByTelegramChatId(chatId);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/moderator/email/{email}")
    public ResponseEntity<UserDTO> findModeratorByEmail(@PathVariable String email) {
        UserDTO user = userService.findModeratorByEmail(email);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserDTO>> searchUsersByUsername(
            @RequestParam String username,
            Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsersByUsername(username, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDTO>> findByRights(@PathVariable UserRole role) {
        return ResponseEntity.ok(userService.findByRights(role));
    }

    @PostMapping("/password")
    public ResponseEntity<Void> updateOwnPassword(
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        userService.updateOwnPassword(currentPassword, newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/data")
    public ResponseEntity<Void> updateOwnData(
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) String avatarUrl) {
        userService.updateOwnData(bio, avatarUrl);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/ban")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> banUser(@PathVariable Long id) {
        userService.banUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        userService.logout();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/favorites")
    public ResponseEntity<Page<ReleaseDTO>> getFavoriteReleases(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getFavoriteReleases(userId, pageable));
    }

    @GetMapping("/{userId}/favorites/type/{type}")
    public ResponseEntity<Page<ReleaseDTO>> getFavoriteReleasesByType(
            @PathVariable Long userId,
            @PathVariable ReleaseType type,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getFavoriteReleasesByType(userId, type, pageable));
    }

    @GetMapping("/{userId}/followed-authors")
    public ResponseEntity<Page<AuthorDTO>> getFollowedAuthors(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowedAuthors(userId, pageable));
    }

    @GetMapping("/{userId}/followed-authors/role/{role}")
    public ResponseEntity<Page<AuthorDTO>> getFollowedAuthorsByRole(
            @PathVariable Long userId,
            @PathVariable AuthorRole role,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowedAuthorsByRole(userId, role, pageable));
    }

    @GetMapping("/{userId}/followed-authors/releases")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesFromFollowedAuthors(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getReleasesFromFollowedAuthors(userId, pageable));
    }

    @GetMapping("/{userId}/followed-authors/releases/type/{type}")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesFromFollowedAuthorsByType(
            @PathVariable Long userId,
            @PathVariable ReleaseType type,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getReleasesFromFollowedAuthorsByType(userId, type, pageable));
    }
} 