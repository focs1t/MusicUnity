package ru.musicunity.backend.model;

import ru.musicunity.backend.pojo.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "registration_requests",
    indexes = {
        @Index(name = "idx_request_email", columnList = "email"),
        @Index(name = "idx_request_username", columnList = "username"),
        @Index(name = "idx_request_status", columnList = "status"),
        @Index(name = "idx_request_created_at", columnList = "created_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Хешированный пароль

    @Column(name = "author_name")
    private String authorName; // Имя автора

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "admin_comment", columnDefinition = "TEXT")
    private String adminComment;

    @Column(name = "admin_email")
    private String adminEmail; // Email админа который обработал заявку
} 