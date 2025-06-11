package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.exception.AuthorCannotAddToFavoritesException;
import ru.musicunity.backend.exception.AuthorNotFoundException;
import ru.musicunity.backend.exception.UserNotFoundException;
import ru.musicunity.backend.mapper.AuthorMapper;
import ru.musicunity.backend.mapper.UserMapper;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.UserFollowing;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.UserFollowingRepository;
import ru.musicunity.backend.repository.UserRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthorFollowingService {
    private final AuthorRepository authorRepository;
    private final UserRepository userRepository;
    private final AuthorMapper authorMapper;

    public Page<AuthorDTO> getFollowedAuthors(User user, Pageable pageable) {
        return authorRepository.findByFollowingsUserUserId(user.getUserId(), pageable)
                .map(this::toDTOWithRatings);
    }

    private AuthorDTO toDTOWithRatings(Author author) {
        AuthorDTO dto = authorMapper.toDTO(author);
        
        Double albumExtendedRating = authorRepository.findAverageAlbumExtendedRating(author.getAuthorId());
        Double albumSimpleRating = authorRepository.findAverageAlbumSimpleRating(author.getAuthorId());
        Double singleEpExtendedRating = authorRepository.findAverageSingleEpExtendedRating(author.getAuthorId());
        Double singleEpSimpleRating = authorRepository.findAverageSingleEpSimpleRating(author.getAuthorId());
        
        dto.setAverageAlbumExtendedRating(albumExtendedRating);
        dto.setAverageAlbumSimpleRating(albumSimpleRating);
        dto.setAverageSingleEpExtendedRating(singleEpExtendedRating);
        dto.setAverageSingleEpSimpleRating(singleEpSimpleRating);
        return dto;
    }

    @Transactional
    public void followAuthor(Long authorId, Long userId) {
        // Проверяем, является ли пользователь автором
        Optional<Author> userAuthor = authorRepository.findByUserUserId(userId);
        if (userAuthor.isPresent()) {
            throw new AuthorCannotAddToFavoritesException();
        }
        
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        
        // Проверяем, не удален ли автор
        if (author.getIsDeleted()) {
            throw new AuthorNotFoundException(authorId);
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!author.getFollowings().stream().anyMatch(f -> f.getUser().getUserId().equals(userId))) {
            UserFollowing following = UserFollowing.builder()
                    .author(author)
                    .user(user)
                    .build();
            author.getFollowings().add(following);
            
            // Пересчитываем количество подписок, исключая удаленных авторов
            long activeFollowingsCount = author.getFollowings().stream()
                    .filter(f -> !f.getAuthor().getIsDeleted())
                    .count();
            author.setFollowingCount((int) activeFollowingsCount);
            
            authorRepository.save(author);
        }
    }

    @Transactional
    public void unfollowAuthor(Long authorId, Long userId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (author.getFollowings().removeIf(following -> following.getUser().getUserId().equals(userId))) {
            // Пересчитываем количество подписок, исключая удаленных авторов
            long activeFollowingsCount = author.getFollowings().stream()
                    .filter(f -> !f.getAuthor().getIsDeleted())
                    .count();
            author.setFollowingCount((int) activeFollowingsCount);
            
            authorRepository.save(author);
        }
    }

    public boolean isFollowing(Long authorId, Long userId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AuthorNotFoundException(authorId));
        return author.getFollowings().stream()
                .anyMatch(following -> following.getUser().getUserId().equals(userId));
    }
} 