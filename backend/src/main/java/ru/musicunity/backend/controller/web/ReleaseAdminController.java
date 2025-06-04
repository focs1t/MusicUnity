package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.service.ReleaseService;
import org.springframework.data.domain.Pageable;

@Controller
@RequestMapping("/admin/releases")
@RequiredArgsConstructor
public class ReleaseAdminController {
    private final ReleaseService releaseService;

    @GetMapping
    public String releases(Model model, @PageableDefault(size = 12) Pageable pageable) {
        Page<ReleaseDTO> releases = releaseService.getAllSorted(pageable);
        model.addAttribute("releases", releases);
        model.addAttribute("title", "Управление релизами");
        model.addAttribute("activePage", "releases");
        return "admin/releases";
    }

    @GetMapping("/deleted")
    public String deletedReleases(Model model, @PageableDefault(size = 12) Pageable pageable) {
        Page<ReleaseDTO> releases = releaseService.getAllDeletedReleases(pageable);
        model.addAttribute("releases", releases);
        model.addAttribute("title", "Удаленные релизы");
        model.addAttribute("activePage", "releases");
        return "admin/releases";
    }

    @PostMapping("/{id}/delete")
    public String deleteRelease(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        releaseService.softDeleteRelease(id);
        redirectAttributes.addFlashAttribute("success", "Релиз успешно удален");
        return "redirect:/admin/releases";
    }

    @PostMapping("/{id}/restore")
    public String restoreRelease(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        releaseService.restoreRelease(id);
        redirectAttributes.addFlashAttribute("success", "Релиз успешно восстановлен");
        return "redirect:/admin/releases";
    }
} 