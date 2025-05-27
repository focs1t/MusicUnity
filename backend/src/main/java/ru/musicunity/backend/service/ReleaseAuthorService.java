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
    private final AuthorRepository authorRepository;

    public Optional<ReleaseAuthor> getAuthorRoleOnRelease(Long releaseId, Long authorId) {
        return releaseAuthorRepository.findByReleaseIdAndAuthorId(releaseId, authorId);
    }

    public List<ReleaseAuthor> getArtistsOnRelease(Long releaseId) {
        return releaseAuthorRepository.findArtistsByReleaseId(releaseId);
    }

    public List<ReleaseAuthor> getProducersOnRelease(Long releaseId) {
        return releaseAuthorRepository.findProducersByReleaseId(releaseId);
    }

    public List<ReleaseAuthor> getReleasesWhereAuthorIsArtist(Long authorId) {
        return releaseAuthorRepository.findReleasesWhereAuthorIsArtist(authorId);
    }

    public List<ReleaseAuthor> getReleasesWhereAuthorIsProducer(Long authorId) {
        return releaseAuthorRepository.findReleasesWhereAuthorIsProducer(authorId);
    }

    public boolean isArtistOnRelease(Long releaseId, Long authorId) {
        return getAuthorRoleOnRelease(releaseId, authorId)
                .map(ReleaseAuthor::getIsArtist)
                .orElse(false);
    }

    public boolean isProducerOnRelease(Long releaseId, Long authorId) {
        return getAuthorRoleOnRelease(releaseId, authorId)
                .map(ReleaseAuthor::getIsProducer)
                .orElse(false);
    }

    @Transactional
    public ReleaseAuthor addAuthorToRelease(Release release, Author author, boolean isArtist, boolean isProducer) {
        ReleaseAuthor.ReleaseAuthorId id = new ReleaseAuthor.ReleaseAuthorId(release.getReleaseId(), author.getAuthorId());
        
        ReleaseAuthor releaseAuthor = ReleaseAuthor.builder()
                .id(id)
                .release(release)
                .author(author)
                .isArtist(isArtist)
                .isProducer(isProducer)
                .build();

        return releaseAuthorRepository.save(releaseAuthor);
    }

    @Transactional
    public Author createAndAddAuthor(Release release, String authorName, boolean isArtist, boolean isProducer) {
        // Проверяем, существует ли автор
        Optional<Author> existingAuthor = authorRepository.findByAuthorName(authorName);
        Author author;

        if (existingAuthor.isPresent()) {
            author = existingAuthor.get();
            // Обновляем роли автора если необходимо
            if (isArtist && !author.getIsArtist()) {
                author.setIsArtist(true);
                author = authorRepository.save(author);
            }
            if (isProducer && !author.getIsProducer()) {
                author.setIsProducer(true);
                author = authorRepository.save(author);
            }
        } else {
            // Создаем нового автора
            author = Author.builder()
                    .authorName(authorName)
                    .isArtist(isArtist)
                    .isProducer(isProducer)
                    .isVerified(false)
                    .followingCount(0)
                    .build();
            author = authorRepository.save(author);
        }

        // Добавляем автора к релизу
        addAuthorToRelease(release, author, isArtist, isProducer);
        
        return author;
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