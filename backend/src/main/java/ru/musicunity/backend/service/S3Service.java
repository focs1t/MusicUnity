package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    private static final Set<String> ALLOWED_IMAGE_TYPES = new HashSet<>(Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    ));

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${s3.bucket}")
    private String bucketName;

    @Value("${s3.endpoint}")
    private String endpoint;

    public String uploadFile(MultipartFile file, String folder) {
        validateFile(file);
        
        String key = folder + "/" + UUID.randomUUID() + "_" + sanitizeFileName(file.getOriginalFilename());
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
            return key;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при загрузке файла", e);
        }
    }

    public String getPresignedUrl(String key) {
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("Ключ файла не может быть пустым");
        }

        if (!(key.startsWith("avatars/") || key.startsWith("covers/"))) {
            throw new IllegalArgumentException("Недопустимый путь к файлу");
        }

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(60))
                .getObjectRequest(req -> req.bucket(bucketName).key(key))
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }

    public String getPermanentUrl(String key) {
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("Ключ файла не может быть пустым");
        }

        if (!(key.startsWith("avatars/") || key.startsWith("covers/"))) {
            throw new IllegalArgumentException("Недопустимый путь к файлу");
        }

        // Формируем постоянную ссылку без подписи
        return String.format("%s/%s/%s", endpoint, bucketName, key);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл не может быть пустым");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Размер файла не может превышать 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Недопустимый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WebP)");
        }
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return UUID.randomUUID().toString();
        }
        // Удаляем все специальные символы и пробелы
        return fileName.replaceAll("[^a-zA-Z0-9.-]", "_");
    }
} 