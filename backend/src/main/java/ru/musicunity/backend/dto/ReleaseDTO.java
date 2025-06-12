package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.ReleaseType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReleaseDTO {
    private Long releaseId;
    private String title;
    private ReleaseType type;
    private LocalDate releaseDate;
    private String coverUrl;
    private String releaseLink;
    private Integer favoritesCount;
    private LocalDateTime addedAt;
    private LocalDateTime deletedAt;
    private List<AuthorDTO> authors;
    private List<GenreDTO> genres;
    private Integer reviewsCount;
    private Double fullReviewRating;
    private Double simpleReviewRating;
    private Integer extendedReviewsCount;
    private Integer simpleReviewsCount;
    private Integer commentCount;
    
    // Поля для совместимости с фронтендом
    private Double averageRating;
    private Double avgRating;
    private Double averageExtendedRating;

    @Data
    public static class AuthorDTO {
        private Long id;
        private String authorName;
        private String avatarUrl;
        private Boolean isArtist;
        private Boolean isProducer;
        private String bio;
        private Boolean isVerified;
        private UserDTO user;

        public AuthorDTO(Long id, String authorName, String avatarUrl, Boolean isArtist, Boolean isProducer, String bio, Boolean isVerified, UserDTO user) {
            this.id = id;
            this.authorName = authorName;
            this.avatarUrl = avatarUrl;
            this.isArtist = isArtist;
            this.isProducer = isProducer;
            this.bio = bio;
            this.isVerified = isVerified;
            this.user = user;
        }
    }

    // Поля для создания релиза
    private List<String> producerNames;
    private List<String> artistNames;
    private List<Long> producerIds;
    private List<Long> artistIds;
    private List<Long> genreIds;
    private Long userId;
} 