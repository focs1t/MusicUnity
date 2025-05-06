package ru.musicunity.backend.pojo.enums;

import jakarta.persistence.Converter;
import jakarta.persistence.AttributeConverter;
import java.util.Arrays;

public enum UserRole {
    BLOCKED(-1),
    REGULAR(0),
    AUTHOR(1),
    MODERATOR(2),
    ADMIN(3);

    private final int code;

    UserRole(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    @Converter(autoApply = true)
    public static class UserRoleConverter implements AttributeConverter<UserRole, Integer> {
        @Override
        public Integer convertToDatabaseColumn(UserRole attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public UserRole convertToEntityAttribute(Integer dbData) {
            return dbData == null ? null : Arrays.stream(UserRole.values())
                    .filter(role -> role.getCode() == dbData)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + dbData));
        }
    }
} 