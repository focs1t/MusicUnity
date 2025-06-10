package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum ReportType {
    REVIEW(0),
    AUTHOR(1),
    RELEASE(2),
    PROFILE(3);

    private final int code;

    ReportType(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    @Converter(autoApply = true)
    public static class ReportTypeConverter implements AttributeConverter<ReportType, Integer> {
        @Override
        public Integer convertToDatabaseColumn(ReportType attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public ReportType convertToEntityAttribute(Integer dbData) {
            return dbData == null ? null : Arrays.stream(ReportType.values())
                    .filter(type -> type.getCode() == dbData)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + dbData));
        }
    }
} 