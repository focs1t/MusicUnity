package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.GenreDTO;
import ru.musicunity.backend.service.GenreService;

@Controller
@RequestMapping("/admin/genres")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class GenreAdminController {

    private final GenreService genreService;

    @GetMapping
    public String listGenres(Model model, @PageableDefault(size = 10) Pageable pageable) {
        Page<GenreDTO> genres = genreService.getAllGenres(pageable);
        model.addAttribute("genres", genres);
        model.addAttribute("title", "Управление жанрами");
        model.addAttribute("activePage", "genres");
        return "admin/genres";
    }

    @PostMapping
    public String createGenre(@RequestParam String name, @RequestParam(required = false) String description) {
        GenreDTO genre = genreService.createGenre(name);
        return "redirect:/admin/genres";
    }

    @PostMapping("/{id}/delete")
    public String deleteGenre(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return "redirect:/admin/genres";
    }
} 