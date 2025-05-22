package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.mapper.AuthorMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.UserFollowing;
import ru.musicunity.backend.pojo.enums.AuthorRole;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.UserFollowingRepository;

@Service
@RequiredArgsConstructor
public class AuthorFollowingService {
    private final AuthorRepository authorRepository;
    private final UserFollowingRepository userFollowingRepository;
    private final AuthorMapper authorMapper;
    private final UserMapper userMapper;

    public Page<AuthorDTO> getFollowedAuthors(User user, Pageable pageable) {
        return authorRepository.findByFollowingsUserUserId(user.getUserId(), pageable)
                .map(authorMapper::toDTO);
    }

    public Page<AuthorDTO> getFollowedAuthorsByRole(User user, AuthorRole role, Pageable pageable) {
        return authorRepository.findByFollowingsUserUserIdAndRole(user.getUserId(), role, pageable)
                .map(authorMapper::toDTO);
    }

    @Transactional
    public void followAuthor(Long authorId, User user) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorId));

        if (!author.getFollowings().stream().anyMatch(f -> f.getUser().getUserId().equals(user.getUserId()))) {
            UserFollowing following = UserFollowing.builder()
                    .author(author)
                    .user(user)
                    .build();
            author.getFollowings().add(following);
            authorRepository.save(author);
        }
    }

    @Transactional
    public void unfollowAuthor(Long authorId, User user) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorId));
        author.getFollowings().removeIf(f -> f.getUser().getUserId().equals(user.getUserId()));
        authorRepository.save(author);
    }
} 