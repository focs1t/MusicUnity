package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.AuditDTO;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.service.AuditService;

@Controller
@RequestMapping("/admin/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditAdminController {

    private final AuditService auditService;

    @GetMapping
    public String listAuditLogs(Model model, @PageableDefault(size = 20) Pageable pageable) {
        Page<AuditDTO> auditLogs = auditService.getAuditLogs(pageable);
        model.addAttribute("auditLogs", auditLogs);
        model.addAttribute("title", "Журнал аудита");
        model.addAttribute("activePage", "audit");
        model.addAttribute("actions", AuditAction.values());
        return "admin/audit/list";
    }

    @GetMapping("/action/{action}")
    public String listAuditLogsByAction(@PathVariable AuditAction action, Model model, 
                                        @PageableDefault(size = 20) Pageable pageable) {
        Page<AuditDTO> auditLogs = auditService.getAuditLogsByActionType(action, pageable);
        model.addAttribute("auditLogs", auditLogs);
        model.addAttribute("title", "Журнал аудита - " + action);
        model.addAttribute("activePage", "audit");
        model.addAttribute("currentAction", action);
        model.addAttribute("actions", AuditAction.values());
        return "admin/audit/list";
    }

    @GetMapping("/moderator/{id}")
    public String listAuditLogsByModerator(@PathVariable Long id, Model model, 
                                           @PageableDefault(size = 20) Pageable pageable) {
        Page<AuditDTO> auditLogs = auditService.getAuditLogsByModerator(id, pageable);
        model.addAttribute("auditLogs", auditLogs);
        model.addAttribute("title", "Журнал аудита модератора");
        model.addAttribute("activePage", "audit");
        model.addAttribute("actions", AuditAction.values());
        return "admin/audit/list";
    }

    @GetMapping("/{id}")
    public String viewAuditLog(@PathVariable Long id, Model model) {
        AuditDTO auditLog = auditService.getAuditLogById(id);
        model.addAttribute("auditLog", auditLog);
        model.addAttribute("title", "Детали записи аудита");
        model.addAttribute("activePage", "audit");
        return "admin/audit/details";
    }
} 