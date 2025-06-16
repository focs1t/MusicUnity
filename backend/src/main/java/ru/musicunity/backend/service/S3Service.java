package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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
        try {
            log.info("Начинаем загрузку файла в S3: name={}, type={}, size={}", 
                    file.getOriginalFilename(), file.getContentType(), file.getSize());
            
            validateFile(file);
            
            String key = folder + "/" + UUID.randomUUID() + "_" + sanitizeFileName(file.getOriginalFilename());
            log.info("Сгенерирован ключ для файла: {}", key);
            
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            log.debug("Отправляем файл в S3 хранилище: bucket={}, key={}", bucketName, key);
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
            log.info("Файл успешно загружен в S3: {}", key);
            
            return key;
        } catch (IOException e) {
            log.error("Ошибка при чтении данных файла", e);
            throw new RuntimeException("Ошибка при загрузке файла: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Неожиданная ошибка при загрузке файла в S3", e);
            throw new RuntimeException("Ошибка при загрузке файла: " + e.getMessage(), e);
        }
    }

    public String getPresignedUrl(String key) {
        if (key == null || key.trim().isEmpty()) {
            log.warn("Попытка получить presigned URL для пустого ключа");
            throw new IllegalArgumentException("Ключ файла не может быть пустым");
        }

        if (!(key.startsWith("avatars/") || key.startsWith("covers/"))) {
            log.warn("Попытка доступа к неразрешенному пути: {}", key);
            throw new IllegalArgumentException("Недопустимый путь к файлу");
        }

        try {
            log.debug("Генерация presigned URL для файла: {}", key);
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(60))
                    .getObjectRequest(req -> req.bucket(bucketName).key(key))
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            log.debug("Сгенерирован presigned URL: {}", presignedRequest.url());
            return presignedRequest.url().toString();
        } catch (Exception e) {
            log.error("Ошибка при генерации presigned URL для файла: {}", key, e);
            throw new RuntimeException("Не удалось создать ссылку на файл: " + e.getMessage(), e);
        }
    }

    public String getPermanentUrl(String key) {
        if (key == null || key.trim().isEmpty()) {
            log.warn("Попытка получить permanent URL для пустого ключа");
            throw new IllegalArgumentException("Ключ файла не может быть пустым");
        }

        if (!(key.startsWith("avatars/") || key.startsWith("covers/"))) {
            log.warn("Попытка доступа к неразрешенному пути: {}", key);
            throw new IllegalArgumentException("Недопустимый путь к файлу");
        }

        // Формируем постоянную ссылку без подписи
        String url = String.format("%s/%s/%s", endpoint, bucketName, key);
        log.debug("Сгенерирован permanent URL: {}", url);
        return url;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.warn("Передан пустой файл");
            throw new IllegalArgumentException("Файл не может быть пустым");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("Превышен максимальный размер файла: {}", file.getSize());
            throw new IllegalArgumentException("Размер файла не может превышать 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            log.warn("Недопустимый тип файла: {}", contentType);
            throw new IllegalArgumentException("Недопустимый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WebP)");
        }
        
        log.debug("Файл успешно прошел валидацию: name={}, type={}, size={}", 
                file.getOriginalFilename(), contentType, file.getSize());
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return UUID.randomUUID().toString();
        }
        // Удаляем все специальные символы и пробелы
        return fileName.replaceAll("[^a-zA-Z0-9.-]", "_");
    }
} 