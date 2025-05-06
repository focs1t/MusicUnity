package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.musicunity.backend.pojo.PasswordResetToken;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser_Id(Long userId);
} 