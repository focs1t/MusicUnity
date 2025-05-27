package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.mapper.AuthorMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.repository.AuthorRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;
    private final UserMapper userMapper;

    public Page<AuthorDTO> getAllAuthorsOrderByRegistrationDate(Pageable pageable) {
        return authorRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(authorMapper::toDTO);
    }

    public Page<AuthorDTO> searchAuthorsByName(String name, Pageable pageable) {
        return authorRepository.findByAuthorNameContainingIgnoreCase(name, pageable)
                .map(authorMapper::toDTO);
    }

    public AuthorDTO getAuthorById(Long id) {
        return authorRepository.findById(id)
                .map(authorMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + id));
    }

    public Optional<AuthorDTO> findByAuthorName(String authorName) {
        return authorRepository.findByAuthorName(authorName)
                .map(authorMapper::toDTO);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO updateAuthor(Long id, AuthorDTO updatedAuthor) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + id));
        
        if (updatedAuthor.getAuthorName() != null) {
            author.setAuthorName(updatedAuthor.getAuthorName());
        }
        if (updatedAuthor.getAvatarUrl() != null) {
            author.setAvatarUrl(updatedAuthor.getAvatarUrl());
        }
        if (updatedAuthor.getBio() != null) {
            author.setBio(updatedAuthor.getBio());
        }
        if (updatedAuthor.getIsArtist() != null) {
            author.setIsArtist(updatedAuthor.getIsArtist());
        }
        if (updatedAuthor.getIsProducer() != null) {
            author.setIsProducer(updatedAuthor.getIsProducer());
        }
        
        return authorMapper.toDTO(authorRepository.save(author));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO createAuthor(String authorName, User user, boolean isArtist, boolean isProducer) {
        Author author = Author.builder()
                .authorName(authorName)
                .user(user)
                .isArtist(isArtist)
                .isProducer(isProducer)
                .isVerified(false)
                .followingCount(0)
                .build();
        return authorMapper.toDTO(authorRepository.save(author));
    }

    public List<AuthorDTO> findArtists() {
        return authorRepository.findByIsArtistTrue()
                .stream()
                .map(authorMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuthorDTO> findProducers() {
        return authorRepository.findByIsProducerTrue()
                .stream()
                .map(authorMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuthorDTO> findArtistsAndProducers() {
        return authorRepository.findByIsArtistTrueAndIsProducerTrue()
                .stream()
                .map(authorMapper::toDTO)
                .collect(Collectors.toList());
    }
}
