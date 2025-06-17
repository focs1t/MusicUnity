package ru.musicunity.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.records.AuthResponse;
import ru.musicunity.backend.pojo.records.LoginRequest;
import ru.musicunity.backend.pojo.records.RegisterRequest;
import ru.musicunity.backend.repository.UserRepository;
import ru.musicunity.backend.security.JwtService;
import ru.musicunity.backend.security.UserDetailsImpl;
import ru.musicunity.backend.service.AuthService;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Аутентификация", description = "API для регистрации, входа и управления аутентификацией")
@Slf4j
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Operation(summary = "Вход в систему", description = "Аутентификация пользователя и получение JWT токена")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Успешная аутентификация"),
        @ApiResponse(responseCode = "401", description = "Неверные учетные данные"),
        @ApiResponse(responseCode = "403", description = "Аккаунт заблокирован")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestParam String username, @RequestParam String password) {
        log.info("Попытка входа пользователя: {}", username);
        
        try {
            // Проверяем, является ли username email-адресом
            boolean isEmail = username.contains("@");
            
            Authentication authentication;
            if (isEmail) {
                // Если username - это email, найдем пользователя по email и используем его имя пользователя
                Optional<User> userOpt = userRepository.findByEmail(username);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(user.getUsername(), password)
                    );
                } else {
                    throw new UsernameNotFoundException("Пользователь с email " + username + " не найден");
                }
            } else {
                // Обычная аутентификация по имени пользователя
                authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
                );
            }
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userDetails.getUser();
            
            // Проверяем, не заблокирован ли пользователь
            if (user.getIsBlocked()) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(new AuthResponse(null));
            }
            
            // Генерируем токен
            String token = jwtService.generateToken(user);
            
            log.info("Успешный вход пользователя: {}", username);
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (BadCredentialsException e) {
            log.warn("Неверные учетные данные для пользователя: {}", username);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null));
        } catch (UsernameNotFoundException e) {
            log.warn("Пользователь не найден: {}", username);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null));
        } catch (Exception e) {
            log.error("Ошибка при авторизации пользователя {}: {}", username, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(null));
        }
    }

    @Operation(summary = "Регистрация нового пользователя", description = "Создание нового аккаунта пользователя")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Успешная регистрация"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные регистрации")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(summary = "Выход из системы", description = "Выход пользователя и инвалидация токена")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Успешный выход"),
        @ApiResponse(responseCode = "401", description = "Неавторизованный доступ")
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
        @Parameter(description = "JWT токен авторизации") @RequestHeader("Authorization") String token) {
        authService.logout(token.replace("Bearer ", ""));
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Запрос сброса пароля", description = "Отправка email для сброса пароля")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Email отправлен"),
        @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
        @Parameter(description = "Email пользователя") @RequestParam String email) {
        authService.requestPasswordReset(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword
    ) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok().build();
    }
}