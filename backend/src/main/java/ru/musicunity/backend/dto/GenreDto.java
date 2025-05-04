package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.Genre;

@Data
public class GenreDto {
    private Long genreId;
    private String name;

    public static GenreDto fromGenre(Genre genre) {
        GenreDto dto = new GenreDto();
        dto.setGenreId(genre.getGenreId());
        dto.setName(genre.getName());
        return dto;
    }
} 