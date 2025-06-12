package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.AuditDTO;
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.pojo.Audit;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.service.AuditService;
import ru.musicunity.backend.service.UserService;
import ru.musicunity.backend.repository.AuditRepository;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@Controller
@RequestMapping("/admin/audit")
@RequiredArgsConstructor
public class AuditAdminController {
    
    private final AuditService auditService;
    private final UserService userService;
    private final AuditRepository auditRepository;

    @GetMapping
    public String auditPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) Long moderatorId,
            @RequestParam(required = false) Long targetId,
            @RequestParam(defaultValue = "false") Boolean isRolledBack,
            @RequestParam(defaultValue = "performedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Model model,
            HttpServletRequest request) {

        try {
            // Создаем объект Pageable с сортировкой
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            // Поиск аудита с фильтрами - упрощенная версия
            Page<Audit> auditLogs;
            
            if (actionType != null && !actionType.isEmpty()) {
                auditLogs = auditRepository.findByActionTypeAndIsRolledBack(
                    AuditAction.valueOf(actionType), isRolledBack, pageable);
            } else if (moderatorId != null) {
                // Используем существующий метод findByModerator и затем фильтруем по isRolledBack
                auditLogs = auditRepository.findByModerator(moderatorId, pageable);
            } else if (targetId != null) {
                auditLogs = auditRepository.findByTargetIdAndIsRolledBack(targetId, isRolledBack, pageable);
            } else {
                auditLogs = auditRepository.findByIsRolledBack(isRolledBack, pageable);
            }

            // Получаем список всех пользователей из аудита
            List<UserDTO> moderators = userService.getAllUsersFromAudit();

            // Добавляем атрибуты в модель
            model.addAttribute("auditLogs", auditLogs);
            model.addAttribute("actionTypes", AuditAction.values());
            model.addAttribute("moderators", moderators);
            model.addAttribute("actionType", actionType);
            model.addAttribute("moderatorId", moderatorId);
            model.addAttribute("targetId", targetId);
            model.addAttribute("isRolledBack", isRolledBack);
            model.addAttribute("sortBy", sortBy);
            model.addAttribute("sortDir", sortDir);

            // AJAX-ответ для динамической загрузки
            if ("XMLHttpRequest".equals(request.getHeader("X-Requested-With"))) {
                return "admin/audit :: auditTable";
            }

            return "admin/audit";
        } catch (Exception e) {
            model.addAttribute("error", "Ошибка при загрузке списка аудита: " + e.getMessage());
            return "admin/audit";
        }
    }

    @GetMapping("/{id}")
    public String viewAuditLog(@PathVariable Long id, Model model) {
        AuditDTO auditLog = auditService.getAuditLogById(id);
        boolean canRollback = auditService.canRollback(id);
        
        model.addAttribute("auditLog", auditLog);
        model.addAttribute("canRollback", canRollback);
        
        return "admin/audit-details";
    }

    @PostMapping(value = "/{id}/rollback", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public ResponseEntity<String> rollbackAction(@PathVariable Long id) {
        try {
            auditService.rollbackAction(id);
            return ResponseEntity.ok("Действие успешно отменено");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка отката: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/can-rollback")
    @ResponseBody
    public ResponseEntity<Boolean> canRollback(@PathVariable Long id) {
        try {
            boolean canRollback = auditService.canRollback(id);
            return ResponseEntity.ok(canRollback);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(false);
        }
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<AuditDTO> getAuditDetails(@PathVariable Long id) {
        try {
            AuditDTO auditLog = auditService.getAuditLogById(id);
            return ResponseEntity.ok(auditLog);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/demote-moderator/{userId}")
    @ResponseBody
    public ResponseEntity<String> demoteModerator(@PathVariable Long userId) {
        try {
            userService.demoteModerator(userId);
            return ResponseEntity.ok("Модератор понижен до пользователя");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при понижении: " + e.getMessage());
        }
    }
} 