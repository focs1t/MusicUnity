package ru.musicunity.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.RegistrationRequestDTO;
import ru.musicunity.backend.pojo.records.AuthResponse;
import ru.musicunity.backend.pojo.records.RegisterRequest;
import ru.musicunity.backend.service.AuthService;
import ru.musicunity.backend.service.RegistrationRequestService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/registration")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Регистрация", description = "API для регистрации пользователей с выбором роли")
public class RegistrationController {

    private final AuthService authService;
    private final RegistrationRequestService registrationRequestService;

    @Operation(summary = "Регистрация обычного пользователя", description = "Создание аккаунта пользователя с ролью USER")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Успешная регистрация"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные регистрации")
    })
    @PostMapping("/user")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (Exception e) {
            log.error("Ошибка регистрации пользователя: {}", e.getMessage());
            throw e;
        }
    }

    @Operation(summary = "Подача заявки на регистрацию как автор", description = "Отправка заявки на регистрацию с ролью AUTHOR. Аккаунт создается только после подтверждения администратором.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Заявка успешно отправлена"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные или пользователь уже существует"),
        @ApiResponse(responseCode = "409", description = "Заявка уже подана или пользователь существует")
    })
    @PostMapping("/author-request")
    public ResponseEntity<?> registerAuthorRequest(@RequestBody AuthorRegistrationRequest request) {
        try {
            RegistrationRequestDTO result = registrationRequestService.submitAuthorRegistrationRequest(
                request.email(),
                request.username(),
                request.password(),
                request.authorName()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Заявка на регистрацию отправлена. Напишите на musicunity@mail.ru с доказательствами ваших музыкальных работ для подтверждения статуса автора.");
            response.put("requestId", result.getRequestId());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Ошибка при подаче заявки на регистрацию: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // DTO для заявки на регистрацию автора
    public record AuthorRegistrationRequest(
        String email,
        String username,
        String password,
        String authorName
    ) {}
} 