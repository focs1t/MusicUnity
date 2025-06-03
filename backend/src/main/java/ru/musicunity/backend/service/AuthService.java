package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.exception.UserEmailNotFoundException;
import ru.musicunity.backend.exception.UserExistsException;
import ru.musicunity.backend.pojo.PasswordResetToken;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.pojo.records.AuthResponse;
import ru.musicunity.backend.pojo.records.RegisterRequest;
import ru.musicunity.backend.repository.PasswordResetTokenRepository;
import ru.musicunity.backend.repository.UserRepository;
import ru.musicunity.backend.security.JwtService;
import ru.musicunity.backend.security.UserDetailsImpl;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthResponse generateToken(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails.getUser());
        return new AuthResponse(token);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserExistsException();
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRights(UserRole.USER);

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public void logout(String token) {
        jwtService.addToBlacklist(token);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserEmailNotFoundException(email));

        // Удаляем старые токены
        tokenRepository.deleteByUser_UserId(user.getUserId());

        // Создаем новый токен
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);

        String resetLink = "http://192.168.31.31:3000/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Неверный токен"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Токен уже был использован");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Срок действия токена истек");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
} 