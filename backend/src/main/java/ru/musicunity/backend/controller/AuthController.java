package ru.musicunity.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.pojo.records.AuthResponse;
import ru.musicunity.backend.pojo.records.LoginRequest;
import ru.musicunity.backend.pojo.records.RegisterRequest;
import ru.musicunity.backend.service.AuthService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Аутентификация", description = "API для аутентификации и регистрации пользователей")
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;

    @Operation(summary = "Вход в систему", description = "Аутентификация пользователя и получение JWT токена")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Успешная аутентификация"),
        @ApiResponse(responseCode = "401", description = "Неверные учетные данные"),
        @ApiResponse(responseCode = "403", description = "Аккаунт заблокирован")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.username(),
                    request.password()
                )
            );
            return ResponseEntity.ok(authService.generateToken(authentication));
        } catch (BadCredentialsException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Неверное имя пользователя или пароль");
            return ResponseEntity.status(401).body(error);
        } catch (LockedException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Аккаунт заблокирован");
            return ResponseEntity.status(403).body(error);
        } catch (AuthenticationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Ошибка аутентификации");
            return ResponseEntity.status(401).body(error);
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