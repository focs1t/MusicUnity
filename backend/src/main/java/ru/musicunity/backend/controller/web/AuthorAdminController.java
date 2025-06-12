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
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.service.AuthorService;

import jakarta.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/admin/authors")
@RequiredArgsConstructor
public class AuthorAdminController {
    
    private final AuthorService authorService;

    @GetMapping
    public String listAuthors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "authorId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long authorId,
            Model model,
            HttpServletRequest request) {
        
        try {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<AuthorDTO> authors;
            
            // Поиск по имени
            if (search != null && !search.trim().isEmpty()) {
                authors = authorService.searchAuthors(search.trim(), pageable);
            }
            // Фильтр по статусу
            else if (status != null && !status.isEmpty()) {
                switch (status) {
                    case "deleted":
                        authors = authorService.getAllDeletedAuthors(pageable);
                        break;
                    default:
                        authors = authorService.getAllAuthors(pageable);
                        break;
                }
            } else {
                authors = authorService.getAllAuthors(pageable);
            }
            
            model.addAttribute("authors", authors);
            model.addAttribute("sortBy", sortBy);
            model.addAttribute("sortDir", sortDir);
            model.addAttribute("search", search);
            model.addAttribute("status", status);
            model.addAttribute("authorId", authorId);
            
            // AJAX-ответ
            if ("XMLHttpRequest".equals(request.getHeader("X-Requested-With"))) {
                return "admin/authors :: authorsTable";
            }
            
            return "admin/authors";
        } catch (Exception e) {
            model.addAttribute("error", "Ошибка при загрузке списка авторов: " + e.getMessage());
            return "admin/authors";
        }
    }





    @PostMapping(value = "/{id}/soft-delete", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public ResponseEntity<String> softDeleteAuthor(@PathVariable Long id) {
        try {
            authorService.softDeleteAuthor(id);
            return ResponseEntity.ok("Автор помечен как удаленный");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка мягкого удаления: " + e.getMessage());
        }
    }

    @PostMapping(value = "/{id}/hard-delete", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public ResponseEntity<String> hardDeleteAuthor(@PathVariable Long id) {
        try {
            authorService.hardDeleteAuthor(id);
            return ResponseEntity.ok("Автор безвозвратно удален");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка удаления автора: " + e.getMessage());
        }
    }

    @PostMapping(value = "/{id}/restore", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public ResponseEntity<String> restoreAuthor(@PathVariable Long id) {
        try {
            authorService.restoreAuthor(id);
            return ResponseEntity.ok("Автор восстановлен");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка восстановления автора: " + e.getMessage());
        }
    }

} 