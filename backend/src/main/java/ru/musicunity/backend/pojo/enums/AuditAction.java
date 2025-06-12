package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum AuditAction {
    USER_BLOCK(0),
    REVIEW_DELETE(1),
    RELEASE_ADD(2),
    AUTHOR_ADD(3),
    USER_DELETE(4),
    RELEASE_CREATE_OWN(7),
    RELEASE_DELETE(8),
    USER_UNBLOCK(9),
    REVIEW_RESTORE(10),
    RELEASE_RESTORE(11),
    AUTHOR_DELETE(12),
    USER_RESTORE(13),
    USER_DEMOTE_FROM_MODERATOR(14);

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