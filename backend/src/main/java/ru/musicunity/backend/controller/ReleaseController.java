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
public class ReleaseController {
    private final ReleaseService releaseService;
    private final FavoriteService favoriteService;
    private final UserService userService;
    private final FollowedReleasesService followedReleasesService;
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
    public ResponseEntity<Page<ReleaseDTO>> getReleasesByAuthor(@PathVariable Long authorId, Pageable pageable) {
        return ResponseEntity.ok(releaseService.getReleasesByAuthor(authorId, pageable));
    }

    @GetMapping("/author/{authorId}/top")
    public ResponseEntity<Page<ReleaseDTO>> getTopReleasesByAuthor(@PathVariable Long authorId) {
        return ResponseEntity.ok(Page.empty());
    }

    @GetMapping("/top")
    public ResponseEntity<Page<ReleaseDTO>> getTopReleasesByReviews() {
        return ResponseEntity.ok(Page.empty());
    }

    @PostMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ReleaseDTO> createRelease(@RequestBody ReleaseDTO releaseDTO) {
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

    @PostMapping("/own")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ReleaseDTO> createOwnRelease(@RequestBody ReleaseDTO releaseDTO) {
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

    @GetMapping("/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getFavoriteReleases(Pageable pageable) {
        return ResponseEntity.ok(favoriteService.getFavoriteReleasesByUser(releaseService.getCurrentUser(), pageable));
    }

    @GetMapping("/favorites/{type}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getFavoriteReleasesByType(@PathVariable ReleaseType type, Pageable pageable) {
        return ResponseEntity.ok(favoriteService.getFavoriteReleasesByUserAndType(releaseService.getCurrentUser(), type, pageable));
    }

    @PostMapping("/{id}/favorite")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> addToFavorites(@PathVariable Long id) {
        favoriteService.addToFavorites(id, releaseService.getCurrentUser().getUserId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/favorite")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeFromFavorites(@PathVariable Long id) {
        favoriteService.removeFromFavorites(id, releaseService.getCurrentUser().getUserId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/followed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesByFollowedAuthors(Pageable pageable) {
        return ResponseEntity.ok(followedReleasesService.getReleasesByFollowedAuthors(releaseService.getCurrentUser(), pageable));
    }

    @GetMapping("/followed/{type}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReleaseDTO>> getReleasesByFollowedAuthorsAndType(
            @PathVariable ReleaseType type,
            Pageable pageable) {
        return ResponseEntity.ok(followedReleasesService.getReleasesByFollowedAuthorsAndType(releaseService.getCurrentUser(), type, pageable));
    }
}