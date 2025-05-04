package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.ReleaseDto;
import ru.musicunity.backend.service.ReleaseService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/releases")
@RequiredArgsConstructor
public class ReleaseController {
    private final ReleaseService releaseService;

    @PostMapping
    public void add(@RequestBody ReleaseDto dto,
                    @RequestParam List<Long> authorIds,
                    @RequestParam List<Long> genreIds) {
        releaseService.addReleaseWithAuthorsAndGenres(dto, authorIds, genreIds);
    }

    @PostMapping("/own")
    public void addOwn(@RequestBody ReleaseDto dto, @RequestParam Long authorId) {
        releaseService.addOwnRelease(dto, authorId);
    }

    @GetMapping("/newest")
    public List<ReleaseDto> getNewest(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        return releaseService.getNewest(page, size);
    }

    @GetMapping("/author/{authorId}/grouped")
    public Map<String, List<ReleaseDto>> getByAuthorGroupedByType(@PathVariable Long authorId,
                                                                  @RequestParam(defaultValue = "0") int page,
                                                                  @RequestParam(defaultValue = "100") int size) {
        return releaseService.getByAuthorGroupedByType(authorId, page, size);
    }

    @GetMapping("/top5/{authorId}")
    public List<ReleaseDto> getTop5ByAuthorByScore(@PathVariable Long authorId) {
        return releaseService.getTop5ByAuthorByScore(authorId);
    }

    @GetMapping("/top15-today")
    public List<ReleaseDto> getTop15ByReviewsToday() {
        return releaseService.getTop15ByReviewsToday();
    }

    @GetMapping("/{id}")
    public ReleaseDto get(@PathVariable Long id) {
        return releaseService.getRelease(id);
    }
}