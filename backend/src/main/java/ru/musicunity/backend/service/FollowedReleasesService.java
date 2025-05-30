package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.mapper.ReleaseMapper;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.UserFollowing;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.UserFollowingRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowedReleasesService {
    private final ReleaseRepository releaseRepository;
    private final UserFollowingRepository userFollowingRepository;
    private final ReleaseMapper releaseMapper;

    public Page<ReleaseDTO> getReleasesByFollowedAuthors(User user, Pageable pageable) {
        List<Author> followedAuthors = userFollowingRepository.findByUserUserId(user.getUserId())
                .stream()
                .map(UserFollowing::getAuthor)
                .collect(Collectors.toList());
        return releaseRepository.findByAuthors(followedAuthors, pageable)
                .map(releaseMapper::toDTO);
    }
} 