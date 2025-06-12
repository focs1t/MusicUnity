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
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import ru.musicunity.backend.dto.GenreDTO;
import ru.musicunity.backend.service.GenreService;

@Controller
@RequestMapping("/admin/genres")
@RequiredArgsConstructor
public class GenreAdminController {

    private final GenreService genreService;

    @GetMapping
    public String listGenres(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "genreId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            Model model) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<GenreDTO> genres = genreService.getAllGenres(pageable);
        
        model.addAttribute("genres", genres);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", genres.getTotalPages());
        model.addAttribute("sortBy", sortBy);
        model.addAttribute("sortDir", sortDir);
        
        return "admin/genres";
    }

    @PostMapping("/load")
    public String loadGenres(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "genreId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            Model model) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<GenreDTO> genres = genreService.getAllGenres(pageable);
        
        model.addAttribute("genres", genres);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", genres.getTotalPages());
        model.addAttribute("sortBy", sortBy);
        model.addAttribute("sortDir", sortDir);
        
        return "admin/genres :: #genresGrid";
    }

    @PostMapping("/create")
    @ResponseBody
    public ResponseEntity<?> createGenre(@RequestParam String name) {
        try {
        GenreDTO genre = genreService.createGenre(name);
            return ResponseEntity.ok().body("Жанр '" + genre.getName() + "' успешно создан");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка создания жанра: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/hard-delete")
    @ResponseBody
    public ResponseEntity<?> hardDeleteGenre(@PathVariable Long id) {
        try {
            genreService.hardDeleteGenre(id);
            return ResponseEntity.ok().body("Жанр безвозвратно удален");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка удаления жанра: " + e.getMessage());
        }
    }
} 