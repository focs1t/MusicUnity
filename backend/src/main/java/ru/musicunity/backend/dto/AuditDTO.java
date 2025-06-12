package ru.musicunity.backend.dto;

import lombok.Data;
import ru.musicunity.backend.pojo.enums.AuditAction;

import java.time.LocalDateTime;

@Data
public class AuditDTO {
    private Long id;
    private Long moderatorId;
    private String moderatorUsername;
    private Long targetId;
    private AuditAction actionType;
    private String description;
    private LocalDateTime performedAt;
    private Boolean isRolledBack;
    private LocalDateTime rollbackAt;
    
    // Метод для получения русского названия действия
    public String getActionDisplayName() {
        if (actionType == null) return "Неизвестно";
        
        switch (actionType) {
            case USER_BLOCK:
                return "Блокировка пользователя";
            case USER_UNBLOCK:
                return "Разблокировка пользователя";
            case REVIEW_DELETE:
                return "Удаление рецензии";
            case REVIEW_RESTORE:
                return "Восстановление рецензии";
            case RELEASE_ADD:
                return "Добавление релиза";
            case RELEASE_DELETE:
                return "Удаление релиза";
            case RELEASE_RESTORE:
                return "Восстановление релиза";
            case RELEASE_CREATE_OWN:
                return "Создание собственного релиза";
            case AUTHOR_ADD:
                return "Добавление автора";
            case AUTHOR_DELETE:
                return "Удаление автора";
            case USER_DELETE:
                return "Удаление пользователя";
            case USER_RESTORE:
                return "Восстановление пользователя";
            case USER_DEMOTE_FROM_MODERATOR:
                return "Понижение модератора";
            default:
                return actionType.toString();
        }
    }
} 