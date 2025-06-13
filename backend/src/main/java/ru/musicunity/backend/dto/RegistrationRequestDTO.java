package ru.musicunity.backend.dto;

import ru.musicunity.backend.pojo.enums.RequestStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequestDTO {

    private Long requestId;
    private String email;
    private String username;
    private String authorName;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private String adminComment;
    private String adminEmail;
} 