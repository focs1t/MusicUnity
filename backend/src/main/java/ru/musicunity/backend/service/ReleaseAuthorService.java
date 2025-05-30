package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.ReleaseAuthor;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.ReleaseAuthorRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReleaseAuthorService {
    private final ReleaseAuthorRepository releaseAuthorRepository;

    public Optional<ReleaseAuthor> getAuthorRoleOnRelease(Long releaseId, Long authorId) {
        return releaseAuthorRepository.findByReleaseIdAndAuthorId(releaseId, authorId);
    }

    @Transactional
    public void removeAuthorFromRelease(Long releaseId, Long authorId) {
        ReleaseAuthor.ReleaseAuthorId id = new ReleaseAuthor.ReleaseAuthorId(releaseId, authorId);
        releaseAuthorRepository.deleteById(id);
    }

    @Transactional
    public void updateAuthorRoles(Long releaseId, Long authorId, boolean isArtist, boolean isProducer) {
        getAuthorRoleOnRelease(releaseId, authorId).ifPresent(releaseAuthor -> {
            releaseAuthor.setIsArtist(isArtist);
            releaseAuthor.setIsProducer(isProducer);
            releaseAuthorRepository.save(releaseAuthor);
        });
    }
} 