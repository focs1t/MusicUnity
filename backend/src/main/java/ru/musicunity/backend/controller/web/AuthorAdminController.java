package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import ru.musicunity.backend.dto.AuthorDTO;
import ru.musicunity.backend.service.AuthorService;
import org.springframework.data.domain.Pageable;

@Controller
@RequestMapping("/admin/authors")
@RequiredArgsConstructor
public class AuthorAdminController {
    private final AuthorService authorService;

    @GetMapping
    public String authors(Model model, @PageableDefault(size = 10) Pageable pageable) {
        Page<AuthorDTO> authors = authorService.getAllAuthors(pageable);
        model.addAttribute("authors", authors);
        model.addAttribute("title", "Управление авторами");
        model.addAttribute("activePage", "authors");
        return "admin/authors";
    }

    @GetMapping("/deleted")
    public String deletedAuthors(Model model, @PageableDefault(size = 10) Pageable pageable) {
        Page<AuthorDTO> authors = authorService.getAllDeletedAuthors(pageable);
        model.addAttribute("authors", authors);
        model.addAttribute("title", "Удаленные авторы");
        model.addAttribute("activePage", "authors");
        return "admin/authors";
    }

    @PostMapping("/{id}/delete")
    public String deleteAuthor(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        authorService.softDeleteAuthor(id);
        redirectAttributes.addFlashAttribute("success", "Автор успешно удален");
        return "redirect:/admin/authors";
    }

    @PostMapping("/{id}/restore")
    public String restoreAuthor(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        authorService.restoreAuthor(id);
        redirectAttributes.addFlashAttribute("success", "Автор успешно восстановлен");
        return "redirect:/admin/authors";
    }
} 