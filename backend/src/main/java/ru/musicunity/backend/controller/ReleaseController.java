package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.ReleaseDto;
import ru.musicunity.backend.dto.ReleaseRequest;
import ru.musicunity.backend.service.ReleaseService;

@RestController
@RequestMapping("/releases")
@RequiredArgsConstructor
public class ReleaseController {
    private final ReleaseService releaseService;

    @PostMapping
    public ResponseEntity<ReleaseDto> createRelease(@RequestBody ReleaseRequest request) {
        return ResponseEntity.ok(releaseService.createRelease(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReleaseDto> getRelease(@PathVariable Long id) {
        return ResponseEntity.ok(releaseService.getRelease(id));
    }

    @GetMapping
    public ResponseEntity<Page<ReleaseDto>> getAllReleases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(releaseService.getAllReleases(page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ReleaseDto>> searchReleases(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(releaseService.searchReleases(query, page, size));
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<Page<ReleaseDto>> getReleasesByAuthor(
            @PathVariable Long authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(releaseService.getReleasesByAuthor(authorId, page, size));
    }

    @GetMapping("/genre/{genreId}")
    public ResponseEntity<Page<ReleaseDto>> getReleasesByGenre(
            @PathVariable Long genreId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(releaseService.getReleasesByGenre(genreId, page, size));
    }

    @GetMapping("/top")
    public ResponseEntity<Page<ReleaseDto>> getTopReleases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(releaseService.getTopReleases(page, size));
    }
}