package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.pojo.Genre;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.ReleaseAuthor;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.AuthorRole;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.GenreRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.UserRepository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestDataInitializer {
    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final ReleaseRepository releaseRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void initializeTestData() {
        log.info("Начало инициализации тестовых данных");
        
        // Проверяем, существуют ли уже тестовые данные
        if (userRepository.count() > 0) {
            log.info("Тестовые данные уже существуют, пропускаем инициализацию");
            return;
        }
        
        // Создание пользователей
        log.info("Создание пользователей");
        User user1 = User.builder()
                .username("user1")
                .email("user1@example.com")
                .passwordHash(passwordEncoder.encode("password"))
                .rights(UserRole.REGULAR)
                .build();

        User user2 = User.builder()
                .username("user2")
                .email("user2@example.com")
                .passwordHash(passwordEncoder.encode("password"))
                .rights(UserRole.REGULAR)
                .build();

        User admin = User.builder()
                .username("admin")
                .email("admin@example.com")
                .passwordHash(passwordEncoder.encode("password"))
                .rights(UserRole.MODERATOR)
                .build();

        User author1 = User.builder()
                .username("author1")
                .email("author1@example.com")
                .passwordHash(passwordEncoder.encode("password"))
                .rights(UserRole.REGULAR)
                .build();

        userRepository.saveAll(Arrays.asList(user1, user2, admin, author1));
        log.info("Пользователи созданы");

        // Создание жанров
        log.info("Создание жанров");
        Genre rock = Genre.builder().name("Rock").build();
        Genre pop = Genre.builder().name("Pop").build();
        Genre hipHop = Genre.builder().name("Hip Hop").build();
        Genre electronic = Genre.builder().name("Electronic").build();
        Genre jazz = Genre.builder().name("Jazz").build();

        List<Genre> savedGenres = genreRepository.saveAll(Arrays.asList(rock, pop, hipHop, electronic, jazz));
        log.info("Жанры созданы");

        // Создание авторов
        log.info("Создание авторов");
        Author beatles = Author.builder()
                .authorName("The Beatles")
                .isVerified(true)
                .user(user1)
                .role(AuthorRole.ARTIST)
                .followingCount(0)
                .build();

        Author michaelJackson = Author.builder()
                .authorName("Michael Jackson")
                .isVerified(true)
                .user(user2)
                .role(AuthorRole.PRODUCER)
                .followingCount(0)
                .build();

        Author eminem = Author.builder()
                .authorName("Eminem")
                .isVerified(true)
                .user(author1)
                .role(AuthorRole.BOTH)
                .followingCount(0)
                .build();

        List<Author> savedAuthors = authorRepository.saveAll(Arrays.asList(beatles, michaelJackson, eminem));
        log.info("Авторы созданы");

        // Создаем релизы
        log.info("Создание релизов");
        Release abbeyRoad = Release.builder()
                .title("Abbey Road")
                .type(ReleaseType.ALBUM)
                .releaseDate(LocalDate.of(1969, 9, 26))
                .favoritesCount(0)
                .build();

        Release thriller = Release.builder()
                .title("Thriller")
                .type(ReleaseType.ALBUM)
                .releaseDate(LocalDate.of(1982, 11, 30))
                .favoritesCount(0)
                .build();

        Release marshallMathers = Release.builder()
                .title("The Marshall Mathers LP")
                .type(ReleaseType.ALBUM)
                .releaseDate(LocalDate.of(2000, 5, 23))
                .favoritesCount(0)
                .build();

        // Сохраняем релизы
        List<Release> savedReleases = releaseRepository.saveAll(Arrays.asList(abbeyRoad, thriller, marshallMathers));
        log.info("Релизы созданы");

        // Создаем связи между релизами и авторами
        log.info("Создание связей между релизами и авторами");
        ReleaseAuthor abbeyRoadAuthor = ReleaseAuthor.builder()
                .id(new ReleaseAuthor.ReleaseAuthorId(savedReleases.get(0).getReleaseId(), savedAuthors.get(0).getAuthorId()))
                .release(savedReleases.get(0))
                .author(savedAuthors.get(0))
                .role(AuthorRole.BOTH)
                .build();
        savedReleases.get(0).getAuthors().add(abbeyRoadAuthor);

        ReleaseAuthor thrillerAuthor = ReleaseAuthor.builder()
                .id(new ReleaseAuthor.ReleaseAuthorId(savedReleases.get(1).getReleaseId(), savedAuthors.get(1).getAuthorId()))
                .release(savedReleases.get(1))
                .author(savedAuthors.get(1))
                .role(AuthorRole.PRODUCER)
                .build();
        savedReleases.get(1).getAuthors().add(thrillerAuthor);

        ReleaseAuthor marshallMathersAuthor = ReleaseAuthor.builder()
                .id(new ReleaseAuthor.ReleaseAuthorId(savedReleases.get(2).getReleaseId(), savedAuthors.get(2).getAuthorId()))
                .release(savedReleases.get(2))
                .author(savedAuthors.get(2))
                .role(AuthorRole.BOTH)
                .build();
        savedReleases.get(2).getAuthors().add(marshallMathersAuthor);

        // Сохраняем релизы с авторами
        releaseRepository.saveAll(savedReleases);
        log.info("Связи между релизами и авторами созданы");

        // Добавляем жанры к релизам
        log.info("Добавление жанров к релизам");
        savedReleases.get(0).getGenres().add(savedGenres.get(0)); // Rock
        savedReleases.get(1).getGenres().add(savedGenres.get(1)); // Pop
        savedReleases.get(2).getGenres().add(savedGenres.get(2)); // Hip Hop

        // Сохраняем релизы с жанрами
        releaseRepository.saveAll(savedReleases);
        log.info("Тестовые данные успешно инициализированы");
    }
} 