package ru.musicunity.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {
    private List<AuthorShortDto> authors;
    private List<ReleaseShortDto> releases;
} 