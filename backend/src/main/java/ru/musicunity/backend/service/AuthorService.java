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
import ru.musicunity.backend.pojo.UserFollowing;
import ru.musicunity.backend.pojo.enums.AuthorRole;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.UserFollowingRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository authorRepository;
    private final UserService userService;
    private final UserFollowingRepository userFollowingRepository;
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
        if (updatedAuthor.getRole() != null) {
            author.setRole(updatedAuthor.getRole());
        }
        
        return authorMapper.toDTO(authorRepository.save(author));
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public AuthorDTO createAuthor(String authorName, User user, AuthorRole role) {
        Author author = Author.builder()
                .authorName(authorName)
                .user(user)
                .role(role)
                .isVerified(false)
                .followingCount(0)
                .build();
        return authorMapper.toDTO(authorRepository.save(author));
    }

    public Page<AuthorDTO> getFollowedAuthors(User user, Pageable pageable) {
        return authorRepository.findByFollowingsUserUserId(user.getUserId(), pageable)
                .map(authorMapper::toDTO);
    }

    public Page<AuthorDTO> getFollowedAuthorsByRole(User user, AuthorRole role, Pageable pageable) {
        return authorRepository.findByFollowingsUserUserIdAndRole(user.getUserId(), role, pageable)
                .map(authorMapper::toDTO);
    }

    @Transactional
    public void followAuthor(Long authorId, Long userId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorId));
        User user = userMapper.toEntity(userService.getUserById(userId));

        if (!author.getFollowings().stream().anyMatch(f -> f.getUser().getUserId().equals(userId))) {
            UserFollowing following = UserFollowing.builder()
                    .author(author)
                    .user(user)
                    .build();
            author.getFollowings().add(following);
            authorRepository.save(author);
        }
    }

    @Transactional
    public void unfollowAuthor(Long authorId, Long userId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorId));
        author.getFollowings().removeIf(f -> f.getUser().getUserId().equals(userId));
        authorRepository.save(author);
    }
}
