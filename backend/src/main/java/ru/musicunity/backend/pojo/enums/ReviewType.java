package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum ReviewType {
    SIMPLE(0),
    EXTENDED(1);

    private final int code;

    ReviewType(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    @Converter(autoApply = true)
    public static class ReviewTypeConverter implements AttributeConverter<ReviewType, Integer> {
        @Override
        public Integer convertToDatabaseColumn(ReviewType attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public ReviewType convertToEntityAttribute(Integer dbData) {
            return dbData == null ? null : Arrays.stream(ReviewType.values())
                    .filter(type -> type.getCode() == dbData)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + dbData));
        }
    }
} 