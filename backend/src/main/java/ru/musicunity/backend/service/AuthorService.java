package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.dto.*;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.repository.AuthorRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository authorRepository;

    public List<AuthorDto> getAllAuthors(int page, int size) {
        return authorRepository.findAll(PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<AuthorDto> searchAuthors(String query, int page, int size) {
        return authorRepository.searchAuthors(query, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public AuthorDto getAuthor(Long id) {
        return authorRepository.findById(id).map(this::toDto).orElseThrow();
    }

    public void updateAuthor(Long id, AuthorDto dto) {
        Author author = authorRepository.findById(id).orElseThrow();
        author.setAuthorName(dto.getAuthorName());
        author.setAvatarUrl(dto.getAvatarUrl());
        authorRepository.save(author);
    }

    public void addAuthor(AuthorDto dto) {
        Author author = Author.builder()
                .authorName(dto.getAuthorName())
                .avatarUrl(dto.getAvatarUrl())
                .isVerified(false)
                .role(Author.AuthorRole.ARTIST)
                .followingCount(0)
                .build();
        authorRepository.save(author);
    }

    private AuthorDto toDto(Author author) {
        AuthorDto dto = new AuthorDto();
        dto.setAuthorId(author.getAuthorId());
        dto.setAuthorName(author.getAuthorName());
        dto.setIsVerified(author.getIsVerified());
        dto.setAvatarUrl(author.getAvatarUrl());
        dto.setFollowingCount(author.getFollowingCount());
        dto.setRole(author.getRole());
        dto.setCreatedAt(author.getCreatedAt());
        return dto;
    }

    private AuthorShortDto toShortDto(Author author) {
        AuthorShortDto dto = new AuthorShortDto();
        dto.setAuthorId(author.getAuthorId());
        dto.setAuthorName(author.getAuthorName());
        dto.setAvatarUrl(author.getAvatarUrl());
        dto.setVerified(author.getIsVerified());
        return dto;
    }
}
