package ru.musicunity.backend.dto.authors;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ru.musicunity.backend.pojo.Author;

public record AuthorRequest(
        @NotBlank @Size(max = 50) String authorName,
        @NotNull Author.AuthorRole role,
        String bio
) {}