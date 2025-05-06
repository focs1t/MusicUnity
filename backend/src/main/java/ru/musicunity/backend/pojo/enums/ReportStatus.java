package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum ReportStatus {
    PENDING(0),
    RESOLVED(1),
    REJECTED(2);

    private final int code;

    ReportStatus(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    @Converter(autoApply = true)
    public static class ReportStatusConverter implements AttributeConverter<ReportStatus, Integer> {
        @Override
        public Integer convertToDatabaseColumn(ReportStatus attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public ReportStatus convertToEntityAttribute(Integer dbData) {
            return dbData == null ? null : Arrays.stream(ReportStatus.values())
                    .filter(status -> status.getCode() == dbData)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + dbData));
        }
    }
} 