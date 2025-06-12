package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.service.ReleaseService;

@Controller
@RequestMapping("/admin/deleted-releases")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DeletedReleasesAdminController {

    private final ReleaseService releaseService;

    @GetMapping
    public String deletedReleasesPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "addedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Model model) {
        
        try {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<ReleaseDTO> deletedReleases = releaseService.getAllDeletedReleases(pageable);
            
            model.addAttribute("deletedReleases", deletedReleases);
            model.addAttribute("sortBy", sortBy);
            model.addAttribute("sortDir", sortDir);
            
            return "admin/deleted-releases";
        } catch (Exception e) {
            model.addAttribute("error", "Ошибка при загрузке удаленных релизов: " + e.getMessage());
            return "admin/deleted-releases";
        }
    }

    @PostMapping("/{id}/restore")
    @ResponseBody
    public ResponseEntity<String> restoreRelease(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            releaseService.restoreRelease(id);
            return ResponseEntity.ok("Релиз успешно восстановлен");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при восстановлении релиза: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/hard-delete")
    @ResponseBody
    public ResponseEntity<String> hardDeleteRelease(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            releaseService.hardDeleteRelease(id);
            return ResponseEntity.ok("Релиз безвозвратно удален");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при удалении релиза: " + e.getMessage());
        }
    }
} 