package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum ReleaseType {
    ALBUM(0),
    SINGLE(1),
    EP(2);

    private final int code;

    ReleaseType(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    @Converter(autoApply = true)
    public static class ReleaseTypeConverter implements AttributeConverter<ReleaseType, Integer> {
        @Override
        public Integer convertToDatabaseColumn(ReleaseType attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public ReleaseType convertToEntityAttribute(Integer dbData) {
            return dbData == null ? null : Arrays.stream(ReleaseType.values())
                    .filter(type -> type.getCode() == dbData)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + dbData));
        }
    }
} 