package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum AuthorRole {
    PERFORMER(0),
    PRODUCER(1),
    BOTH(2);

    private final int code;

    AuthorRole(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    @Converter(autoApply = true)
    public static class AuthorRoleConverter implements AttributeConverter<AuthorRole, Integer> {
        @Override
        public Integer convertToDatabaseColumn(AuthorRole attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public AuthorRole convertToEntityAttribute(Integer dbData) {
            return dbData == null ? null : Arrays.stream(AuthorRole.values())
                    .filter(role -> role.getCode() == dbData)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + dbData));
        }
    }
} 