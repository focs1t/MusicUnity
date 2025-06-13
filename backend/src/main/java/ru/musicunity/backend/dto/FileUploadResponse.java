package ru.musicunity.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileUploadResponse {
    private String key;
    private String temporaryUrl;
    private String permanentUrl;
    
    // Конструктор для обратной совместимости (только временная ссылка)
    public FileUploadResponse(String key, String temporaryUrl) {
        this.key = key;
        this.temporaryUrl = temporaryUrl;
        this.permanentUrl = null;
    }
} 