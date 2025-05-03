package ru.musicunity.backend.dto.users;

import jakarta.validation.constraints.NotBlank;

public record UserLoginRequest(
        @NotBlank String email,
        @NotBlank String password
) {}