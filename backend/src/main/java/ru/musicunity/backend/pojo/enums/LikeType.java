package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum LikeType {
    REGULAR(0),
    AUTHOR(1);

    private final int code;

    LikeType(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    @Converter(autoApply = true)
    public static class LikeTypeConverter implements AttributeConverter<LikeType, Integer> {
        @Override
        public Integer convertToDatabaseColumn(LikeType attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public LikeType convertToEntityAttribute(Integer dbData) {
            return dbData == null ? null : Arrays.stream(LikeType.values())
                    .filter(type -> type.getCode() == dbData)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + dbData));
        }
    }
} 