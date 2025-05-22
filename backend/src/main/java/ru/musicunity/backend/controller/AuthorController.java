package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.pojo.enums.AuthorRole;
import ru.musicunity.backend.service.AuthorService;
import ru.musicunity.backend.service.AuthorFollowingService;
import ru.musicunity.backend.service.UserService;
import ru.musicunity.backend.mapper.UserMapper;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/authors")
@RequiredArgsConstructor
public class AuthorController {
    private final AuthorService authorService;
    private final AuthorFollowingService authorFollowingService;
    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping
    public ResponseEntity<Page<AuthorDTO>> getAllAuthors(Pageable pageable) {
        return ResponseEntity.ok(authorService.getAllAuthorsOrderByRegistrationDate(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AuthorDTO>> searchAuthors(
            @RequestParam String name,
            Pageable pageable) {
        return ResponseEntity.ok(authorService.searchAuthorsByName(name, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorDTO> getAuthorById(@PathVariable Long id) {
        return ResponseEntity.ok(authorService.getAuthorById(id));
    }

    @GetMapping("/name/{authorName}")
    public ResponseEntity<AuthorDTO> getAuthorByName(@PathVariable String authorName) {
        Optional<AuthorDTO> author = authorService.findByAuthorName(authorName);
        return author.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<AuthorDTO> updateAuthor(
            @PathVariable Long id,
            @RequestBody AuthorDTO updatedAuthor) {
        return ResponseEntity.ok(authorService.updateAuthor(id, updatedAuthor));
    }

    @PostMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<AuthorDTO> createAuthor(
            @RequestParam String authorName,
            @RequestParam Long userId,
            @RequestParam AuthorRole role) {
        return ResponseEntity.ok(authorService.createAuthor(
                authorName,
                userMapper.toEntity(userService.getUserById(userId)),
                role));
    }

    @GetMapping("/followed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<AuthorDTO>> getFollowedAuthors(
            @RequestParam Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(authorFollowingService.getFollowedAuthors(
                userMapper.toEntity(userService.getUserById(userId)),
                pageable));
    }

    @GetMapping("/followed/role")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<AuthorDTO>> getFollowedAuthorsByRole(
            @RequestParam Long userId,
            @RequestParam AuthorRole role,
            Pageable pageable) {
        return ResponseEntity.ok(authorFollowingService.getFollowedAuthorsByRole(
                userMapper.toEntity(userService.getUserById(userId)),
                role,
                pageable));
    }

    @PostMapping("/{authorId}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> followAuthor(
            @PathVariable Long authorId,
            @RequestParam Long userId) {
        authorFollowingService.followAuthor(authorId, userMapper.toEntity(userService.getUserById(userId)));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{authorId}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unfollowAuthor(
            @PathVariable Long authorId,
            @RequestParam Long userId) {
        authorFollowingService.unfollowAuthor(authorId, userMapper.toEntity(userService.getUserById(userId)));
        return ResponseEntity.ok().build();
    }
} 