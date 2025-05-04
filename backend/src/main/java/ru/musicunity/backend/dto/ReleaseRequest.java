package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.Release;

import java.util.List;

@Data
public class ReleaseRequest {
    private String title;
    private String description;
    private String coverUrl;
    private Release.ReleaseType type;
    private int year;
    private List<Long> authorIds;
    private List<Long> genreIds;
    private List<NewAuthorRequest> newAuthors;
} 