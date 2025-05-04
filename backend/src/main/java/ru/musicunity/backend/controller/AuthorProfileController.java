package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.AuthorDto;
import ru.musicunity.backend.service.AuthorService;

import java.util.List;

@RestController
@RequestMapping("/authors")
@RequiredArgsConstructor
public class AuthorProfileController {
    private final AuthorService authorService;

    @GetMapping
    public List<AuthorDto> getAll(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size) {
        return authorService.getAllAuthors(page, size);
    }

    @GetMapping("/search")
    public List<AuthorDto> search(@RequestParam String query,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size) {
        return authorService.searchAuthors(query, page, size);
    }

    @GetMapping("/{id}")
    public AuthorDto get(@PathVariable Long id) {
        return authorService.getAuthor(id);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody AuthorDto dto) {
        authorService.updateAuthor(id, dto);
    }

    @PostMapping
    public void add(@RequestBody AuthorDto dto) {
        authorService.addAuthor(dto);
    }
}