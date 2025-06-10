package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum RequestStatus {
    PENDING(0),      // В ожидании
    APPROVED(1),     // Одобрена
    REJECTED(2);     // Отклонена

    private final int code;

    RequestStatus(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    @Converter(autoApply = true)
    public static class RequestStatusConverter implements AttributeConverter<RequestStatus, Integer> {
        @Override
        public Integer convertToDatabaseColumn(RequestStatus attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public RequestStatus convertToEntityAttribute(Integer dbData) {
            return dbData == null ? null : Arrays.stream(RequestStatus.values())
                    .filter(status -> status.getCode() == dbData)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + dbData));
        }
    }
} 