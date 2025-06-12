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
import ru.musicunity.backend.dto.ReleaseDTO;
import ru.musicunity.backend.pojo.enums.ReleaseType;
import ru.musicunity.backend.service.ReleaseService;

@Controller
@RequestMapping("/admin/releases")
@RequiredArgsConstructor
public class ReleaseAdminController {
    
    private final ReleaseService releaseService;

    @GetMapping
    public String listReleases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "releaseId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String releaseType,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "false") Boolean showDeleted,
            Model model) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ReleaseDTO> releases;
        
        if (showDeleted) {
            releases = releaseService.getAllDeletedReleases(pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            releases = releaseService.searchReleases(search.trim(), pageable);
        } else {
            releases = releaseService.getAllSorted(pageable);
        }
        
        model.addAttribute("releases", releases);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", releases.getTotalPages());
        model.addAttribute("sortBy", sortBy);
        model.addAttribute("sortDir", sortDir);
        model.addAttribute("search", search);
        model.addAttribute("releaseType", releaseType);
        model.addAttribute("year", year);
        model.addAttribute("showDeleted", showDeleted);
        model.addAttribute("releaseTypes", ReleaseType.values());
        
        return "admin/releases";
    }

    @PostMapping("/load")
    public String loadReleases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "releaseId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String releaseType,
            @RequestParam(required = false) Integer year,
            Model model) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ReleaseDTO> releases;
        if (search != null && !search.trim().isEmpty()) {
            releases = releaseService.searchReleases(search.trim(), pageable);
        } else {
            releases = releaseService.getAllSorted(pageable);
        }
        
        model.addAttribute("releases", releases);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", releases.getTotalPages());
        model.addAttribute("sortBy", sortBy);
        model.addAttribute("sortDir", sortDir);
        model.addAttribute("search", search);
        model.addAttribute("releaseType", releaseType);
        model.addAttribute("year", year);
        
        return "admin/releases";
    }

    @PostMapping("/{id}/soft-delete")
    @ResponseBody
    public ResponseEntity<?> softDeleteRelease(@PathVariable Long id) {
        try {
        releaseService.softDeleteRelease(id);
            return ResponseEntity.ok().body("Релиз помечен как удаленный");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка мягкого удаления: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/hard-delete")
    @ResponseBody
    public ResponseEntity<?> hardDeleteRelease(@PathVariable Long id) {
        try {
            releaseService.hardDeleteRelease(id);
            return ResponseEntity.ok().body("Релиз безвозвратно удален");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка удаления релиза: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/restore")
    @ResponseBody
    public ResponseEntity<?> restoreRelease(@PathVariable Long id) {
        try {
        releaseService.restoreRelease(id);
            return ResponseEntity.ok().body("Релиз восстановлен");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка восстановления релиза: " + e.getMessage());
        }
    }

    @GetMapping("/deleted")
    public String deletedReleases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "releaseId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Model model) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ReleaseDTO> releases = releaseService.getAllDeletedReleases(pageable);
        
        model.addAttribute("releases", releases);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", releases.getTotalPages());
        model.addAttribute("sortBy", sortBy);
        model.addAttribute("sortDir", sortDir);
        model.addAttribute("showDeleted", true);
        
        return "admin/releases";
    }


} 