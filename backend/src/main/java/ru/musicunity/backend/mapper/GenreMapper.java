package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.GenreDTO;
import ru.musicunity.backend.pojo.Genre;

@Component
public class GenreMapper {
    
    public GenreDTO toDTO(Genre genre) {
        if (genre == null) {
            return null;
        }
        
        GenreDTO dto = new GenreDTO();
        dto.setGenreId(genre.getGenreId());
        dto.setName(genre.getName());
        
        return dto;
    }
    
    public Genre toEntity(GenreDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Genre genre = new Genre();
        genre.setGenreId(dto.getGenreId());
        genre.setName(dto.getName());
        
        return genre;
    }
} 