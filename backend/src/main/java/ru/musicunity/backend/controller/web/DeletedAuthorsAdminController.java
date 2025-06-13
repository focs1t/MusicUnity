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
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.service.AuthorService;

@Controller
@RequestMapping("/admin/deleted-authors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DeletedAuthorsAdminController {

    private final AuthorService authorService;

    @GetMapping
    public String deletedAuthorsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Model model) {
        
        try {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<AuthorDTO> deletedAuthors = authorService.getAllDeletedAuthors(pageable);
            
            model.addAttribute("deletedAuthors", deletedAuthors);
            model.addAttribute("sortBy", sortBy);
            model.addAttribute("sortDir", sortDir);
            
            return "admin/deleted-authors";
        } catch (Exception e) {
            model.addAttribute("error", "Ошибка при загрузке удаленных авторов: " + e.getMessage());
            return "admin/deleted-authors";
        }
    }

    @PostMapping("/{id}/restore")
    @ResponseBody
    public ResponseEntity<String> restoreAuthor(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            authorService.restoreAuthor(id);
            return ResponseEntity.ok("Автор успешно восстановлен");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при восстановлении автора: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/hard-delete")
    @ResponseBody
    public ResponseEntity<String> hardDeleteAuthor(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            authorService.hardDeleteAuthor(id);
            return ResponseEntity.ok("Автор безвозвратно удален");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при удалении автора: " + e.getMessage());
        }
    }
} 