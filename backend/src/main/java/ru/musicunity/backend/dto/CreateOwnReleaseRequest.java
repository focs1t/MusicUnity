package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.ReleaseType;

import java.time.LocalDate;
import java.util.Set;

@Data
public class CreateOwnReleaseRequest {
    private String title;
    private ReleaseType type;
    private LocalDate releaseDate;
    private String coverUrl;
    private boolean isArtist;    // Роль исполнителя для текущего пользователя
    private boolean isProducer;  // Роль продюсера для текущего пользователя
    private Set<AuthorRoleRequest> otherAuthors;  // Другие авторы
    private Set<Long> genreIds;

    @Data
    public static class AuthorRoleRequest {
        private String authorName;
        private boolean artist;
        private boolean producer;
    }
} 