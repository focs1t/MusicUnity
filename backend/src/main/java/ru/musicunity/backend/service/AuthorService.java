package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.UserFollowing;
import ru.musicunity.backend.pojo.enums.AuthorRole;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.UserFollowingRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthorService {
    private final AuthorRepository authorRepository;
    private final UserService userService;
    private final UserFollowingRepository userFollowingRepository;

    public Page<Author> getAllAuthorsOrderByRegistrationDate(Pageable pageable) {
        return authorRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<Author> searchAuthorsByName(String name, Pageable pageable) {
        return authorRepository.findByAuthorNameContainingIgnoreCase(name, pageable);
    }

    public Author getAuthorById(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + id));
    }

    public Optional<Author> findByAuthorName(String authorName) {
        return authorRepository.findByAuthorName(authorName);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public Author updateAuthor(Long id, Author updatedAuthor) {
        Author author = getAuthorById(id);
        
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
        
        return authorRepository.save(author);
    }

    @Transactional
    @PreAuthorize("hasRole('MODERATOR')")
    public Author createAuthor(String authorName, User user, AuthorRole role) {
        Author author = Author.builder()
                .authorName(authorName)
                .user(user)
                .role(role)
                .isVerified(false)
                .followingCount(0)
                .build();
        return authorRepository.save(author);
    }

    public Page<Author> getFollowedAuthors(User user, Pageable pageable) {
        return authorRepository.findByFollowingsUserUserId(user.getUserId(), pageable);
    }

    public Page<Author> getFollowedAuthorsByRole(User user, AuthorRole role, Pageable pageable) {
        return authorRepository.findByFollowingsUserUserIdAndRole(user.getUserId(), role, pageable);
    }

    @Transactional
    public void followAuthor(Long authorId, Long userId) {
        Author author = getAuthorById(authorId);
        User user = userService.getUserById(userId);

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
        Author author = getAuthorById(authorId);
        author.getFollowings().removeIf(f -> f.getUser().getUserId().equals(userId));
        authorRepository.save(author);
    }
}
