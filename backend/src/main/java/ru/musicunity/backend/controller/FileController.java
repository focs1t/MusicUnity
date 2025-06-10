package ru.musicunity.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.musicunity.backend.dto.FileUploadResponse;
import ru.musicunity.backend.service.S3Service;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Файлы", description = "API для работы с файлами (аватары, обложки)")
public class FileController {

    private final S3Service s3Service;

    @Operation(
        summary = "Загрузить аватар пользователя",
        description = "Загружает файл аватара в S3 хранилище. Доступно только аутентифицированным пользователям."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Файл успешно загружен",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = FileUploadResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Пользователь не аутентифицирован"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректный файл или ошибка загрузки"
        )
    })
    @PostMapping(value = "/upload/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FileUploadResponse> uploadAvatar(
        @Parameter(
            description = "Файл аватара (изображение)",
            required = true,
            content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
        )
        @RequestParam("file") MultipartFile file
    ) {
        String key = s3Service.uploadFile(file, "avatars");
        String url = s3Service.getPresignedUrl(key);
        return ResponseEntity.ok(new FileUploadResponse(key, url));
    }

    @Operation(
        summary = "Загрузить обложку релиза",
        description = "Загружает файл обложки в S3 хранилище. Доступно только авторам."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Файл успешно загружен",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = FileUploadResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Пользователь не аутентифицирован"
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Пользователь не является автором"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректный файл или ошибка загрузки"
        )
    })
    @PostMapping(value = "/upload/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<FileUploadResponse> uploadCover(
        @Parameter(
            description = "Файл обложки (изображение)",
            required = true,
            content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
        )
        @RequestParam("file") MultipartFile file
    ) {
        String key = s3Service.uploadFile(file, "covers");
        String url = s3Service.getPresignedUrl(key);
        return ResponseEntity.ok(new FileUploadResponse(key, url));
    }

    @Operation(
        summary = "Получить временный URL для файла",
        description = "Генерирует временный URL для доступа к файлу в S3 хранилище. URL действителен 60 минут."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "URL успешно сгенерирован",
            content = @Content(
                mediaType = MediaType.TEXT_PLAIN_VALUE,
                schema = @Schema(type = "string", example = "https://s3.twcstorage.ru/...")
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректный ключ файла"
        )
    })
    @GetMapping("/presigned")
    public ResponseEntity<String> getPresignedUrl(
        @Parameter(
            description = "Ключ файла (например, 'avatars/uuid_filename.jpg')",
            required = true,
            example = "avatars/123e4567-e89b-12d3-a456-426614174000_avatar.jpg"
        )
        @RequestParam("key") String key
    ) {
        String url = s3Service.getPresignedUrl(key);
        return ResponseEntity.ok(url);
    }

    @Operation(
        summary = "Получить постоянный URL для файла",
        description = "Формирует постоянный URL для доступа к файлу в S3 хранилище."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "URL успешно сформирован",
            content = @Content(
                mediaType = MediaType.TEXT_PLAIN_VALUE,
                schema = @Schema(type = "string", example = "https://s3.twcstorage.ru/bucket/avatars/filename.jpg")
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Некорректный ключ файла"
        )
    })
    @GetMapping("/permanent")
    public ResponseEntity<String> getPermanentUrl(
        @Parameter(
            description = "Ключ файла (например, 'avatars/uuid_filename.jpg')",
            required = true,
            example = "avatars/123e4567-e89b-12d3-a456-426614174000_avatar.jpg"
        )
        @RequestParam("key") String key
    ) {
        String url = s3Service.getPermanentUrl(key);
        return ResponseEntity.ok(url);
    }
} 