package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.exception.AuthorAlreadyExistsException;
import ru.musicunity.backend.exception.AuthorNotFoundException;
import ru.musicunity.backend.mapper.AuthorMapper;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.service.UserService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository authorRepository;
    private final UserService userService;
    private final AuthorMapper authorMapper;

    public Page<AuthorDTO> findAllSorted(Pageable pageable) {
        return authorRepository.findAllSorted(pageable)
                .map(this::toDTOWithRatings);
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

    public Page<AuthorDTO> findArtists(Pageable pageable) {
        return authorRepository.findByIsArtistTrue(pageable)
                .map(this::toDTOWithRatings);
    }

    public Page<AuthorDTO> findProducers(Pageable pageable) {
        return authorRepository.findByIsProducerTrue(pageable)
                .map(this::toDTOWithRatings);
    }

    private AuthorDTO toDTOWithRatings(Author author) {
        AuthorDTO dto = authorMapper.toDTO(author);
        dto.setAverageAlbumExtendedRating(authorRepository.findAverageAlbumExtendedRating(author.getAuthorId()));
        dto.setAverageAlbumSimpleRating(authorRepository.findAverageAlbumSimpleRating(author.getAuthorId()));
        dto.setAverageSingleEpExtendedRating(authorRepository.findAverageSingleEpExtendedRating(author.getAuthorId()));
        dto.setAverageSingleEpSimpleRating(authorRepository.findAverageSingleEpSimpleRating(author.getAuthorId()));
        return dto;
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO updateAuthor(Long id, AuthorDTO updatedAuthor) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AuthorNotFoundException(id));
        
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
    public AuthorDTO createAuthor(String authorName, Boolean isArtist, Boolean isProducer) {
        // Проверяем, не существует ли уже автор с таким именем
        if (authorRepository.findByAuthorName(authorName).isPresent()) {
            throw new AuthorAlreadyExistsException(authorName);
        }

        Author author = Author.builder()
                .authorName(authorName)
                .isArtist(isArtist)
                .isProducer(isProducer)
                .isVerified(false)
                .followingCount(0)
                .isDeleted(false)
                .build();

        return authorMapper.toDTO(authorRepository.save(author));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public void softDeleteAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        author.setIsDeleted(true);
        authorRepository.save(author);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void hardDeleteAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        authorRepository.delete(author);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void restoreAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        author.setIsDeleted(false);
        authorRepository.save(author);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Page<AuthorDTO> getAllDeletedAuthors(Pageable pageable) {
        return authorRepository.findAllDeleted(pageable)
                .map(authorMapper::toDTO);
    }

    public Page<AuthorDTO> getAllAuthors(Pageable pageable) {
        return authorRepository.findAllNotDeleted(pageable)
                .map(authorMapper::toDTO);
    }

    public Page<AuthorDTO> searchAuthors(String query, Pageable pageable) {
        return authorRepository.findByAuthorNameContainingIgnoreCase(query, pageable)
                .map(authorMapper::toDTO);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO verifyAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        author.setIsVerified(true);
        return authorMapper.toDTO(authorRepository.save(author));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO unverifyAuthor(Long authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        author.setIsVerified(false);
        return authorMapper.toDTO(authorRepository.save(author));
    }
}
