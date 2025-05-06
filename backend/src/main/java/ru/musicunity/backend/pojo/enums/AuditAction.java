package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum AuditAction {
    USER_BLOCK(0),
    REVIEW_DELETE(1),
    RELEASE_ADD(2),
    AUTHOR_ADD(3);

    private final int code;

    AuditAction(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    @Converter(autoApply = true)
    public static class AuditActionConverter implements AttributeConverter<AuditAction, Integer> {
        @Override
        public Integer convertToDatabaseColumn(AuditAction attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public AuditAction convertToEntityAttribute(Integer dbData) {
            return dbData == null ? null : Arrays.stream(AuditAction.values())
                    .filter(action -> action.getCode() == dbData)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + dbData));
        }
    }
} 