package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.ReleaseType;

import java.time.LocalDate;
import java.util.Set;

@Data
public class CreateReleaseRequest {
    private String title;
    private ReleaseType type;
    private LocalDate releaseDate;
    private String coverUrl;
    private Set<AuthorRoleRequest> authors;
    private Set<Long> genreIds;

    @Data
    public static class AuthorRoleRequest {
        private String authorName;  // Имя автора (новое или существующее)
        private boolean artist;    // Убрали префикс "is"
        private boolean producer;  // Убрали префикс "is"
    }
} 