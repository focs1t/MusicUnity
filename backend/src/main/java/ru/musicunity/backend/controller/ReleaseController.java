package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.service.ReleaseService;
import ru.musicunity.backend.service.UserService;
import ru.musicunity.backend.mapper.UserMapper;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/releases")
@RequiredArgsConstructor
public class ReleaseController {
    private final ReleaseService releaseService;
    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/{id}")
    public ResponseEntity<ReleaseDTO> getReleaseById(@PathVariable Long id) {
        return ResponseEntity.ok(releaseService.getReleaseById(id));
    }

    @GetMapping("/new")
    public ResponseEntity<Page<ReleaseDTO>> getNewReleases(Pageable pageable) {
        return ResponseEntity.ok(releaseService.getNewReleases(pageable));
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesByAuthor(
            @PathVariable Long authorId,
            Pageable pageable) {
        return ResponseEntity.ok(releaseService.getReleasesByAuthor(authorId, pageable));
    }

    @GetMapping("/author/{authorId}/top")
    public ResponseEntity<List<ReleaseDTO>> getTopReleasesByAuthor(@PathVariable Long authorId) {
        return ResponseEntity.ok(releaseService.getTopReleasesByAuthor(authorId));
    }

    @GetMapping("/top/reviews")
    public ResponseEntity<List<ReleaseDTO>> getTopReleasesByReviews() {
        return ResponseEntity.ok(releaseService.getTopReleasesByReviews());
    }

    @PostMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReleaseDTO> createRelease(
            @RequestParam String title,
            @RequestParam ReleaseType type,
            @RequestParam LocalDate releaseDate,
            @RequestParam(required = false) String coverUrl,
            @RequestParam(required = false) String releaseLink,
            @RequestParam(required = false) List<String> producerNames,
            @RequestParam(required = false) List<String> artistNames,
            @RequestParam(required = false) List<Long> producerIds,
            @RequestParam(required = false) List<Long> artistIds,
            @RequestParam List<Long> genreIds) {
        return ResponseEntity.ok(releaseService.createRelease(
                title, type, releaseDate, coverUrl, releaseLink,
                producerNames, artistNames, producerIds, artistIds, genreIds));
    }

    @PostMapping("/own")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ReleaseDTO> createOwnRelease(
            @RequestParam String title,
            @RequestParam ReleaseType type,
            @RequestParam LocalDate releaseDate,
            @RequestParam(required = false) String coverUrl,
            @RequestParam(required = false) String releaseLink,
            @RequestParam(required = false) List<String> producerNames,
            @RequestParam(required = false) List<String> artistNames,
            @RequestParam(required = false) List<Long> producerIds,
            @RequestParam(required = false) List<Long> artistIds,
            @RequestParam List<Long> genreIds,
            @RequestParam Long userId) {
        return ResponseEntity.ok(releaseService.createOwnRelease(
                title, type, releaseDate, coverUrl, releaseLink,
                producerNames, artistNames, producerIds, artistIds, genreIds, userId));
    }

    @GetMapping("/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getFavoriteReleases(
            @RequestParam Long userId,
            Pageable pageable) {
        User user = userMapper.toEntity(userService.getUserById(userId));
        return ResponseEntity.ok(releaseService.getFavoriteReleasesByUser(user, pageable));
    }

    @GetMapping("/favorites/type")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getFavoriteReleasesByType(
            @RequestParam Long userId,
            @RequestParam ReleaseType type,
            Pageable pageable) {
        User user = userMapper.toEntity(userService.getUserById(userId));
        return ResponseEntity.ok(releaseService.getFavoriteReleasesByUserAndType(user, type, pageable));
    }

    @PostMapping("/{releaseId}/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> addToFavorites(
            @PathVariable Long releaseId,
            @RequestParam Long userId) {
        releaseService.addToFavorites(releaseId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{releaseId}/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeFromFavorites(
            @PathVariable Long releaseId,
            @RequestParam Long userId) {
        releaseService.removeFromFavorites(releaseId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/followed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesByFollowedAuthors(
            @RequestParam Long userId,
            Pageable pageable) {
        User user = userMapper.toEntity(userService.getUserById(userId));
        return ResponseEntity.ok(releaseService.getReleasesByFollowedAuthors(user, pageable));
    }

    @GetMapping("/followed/type")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesByFollowedAuthorsAndType(
            @RequestParam Long userId,
            @RequestParam ReleaseType type,
            Pageable pageable) {
        User user = userMapper.toEntity(userService.getUserById(userId));
        return ResponseEntity.ok(releaseService.getReleasesByFollowedAuthorsAndType(user, type, pageable));
    }
}