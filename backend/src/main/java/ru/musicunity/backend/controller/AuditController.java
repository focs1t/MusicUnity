package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.AuditDto;
import ru.musicunity.backend.service.AuditService;

import java.util.List;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuditService auditService;

    @GetMapping("/newest")
    public List<AuditDto> getNewest(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        return auditService.getNewest(page, size);
    }

    @GetMapping("/oldest")
    public List<AuditDto> getOldest(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        return auditService.getOldest(page, size);
    }

    @GetMapping("/moderator/{moderatorId}")
    public List<AuditDto> getByModerator(@PathVariable Long moderatorId,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        return auditService.getByModerator(moderatorId, page, size);
    }

    @GetMapping("/action/{actionType}")
    public List<AuditDto> getByActionType(@PathVariable String actionType,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        return auditService.getByActionType(actionType, page, size);
    }

    @GetMapping("/{id}")
    public AuditDto getAudit(@PathVariable Long id) {
        return auditService.getAudit(id);
    }

    @DeleteMapping("/clear")
    public void clearAll() {
        auditService.clearAll();
    }
}