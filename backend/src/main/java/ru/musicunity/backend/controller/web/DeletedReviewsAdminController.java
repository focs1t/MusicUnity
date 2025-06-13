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
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.service.ReviewService;

@Controller
@RequestMapping("/admin/deleted-reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DeletedReviewsAdminController {

    private final ReviewService reviewService;

    @GetMapping
    public String deletedReviewsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Model model) {
        
        try {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<ReviewDTO> deletedReviews = reviewService.getAllDeletedReviews(pageable);
            
            model.addAttribute("deletedReviews", deletedReviews);
            model.addAttribute("sortBy", sortBy);
            model.addAttribute("sortDir", sortDir);
            
            return "admin/deleted-reviews";
        } catch (Exception e) {
            model.addAttribute("error", "Ошибка при загрузке удаленных рецензий: " + e.getMessage());
            return "admin/deleted-reviews";
        }
    }

    @PostMapping("/{id}/restore")
    @ResponseBody
    public ResponseEntity<String> restoreReview(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            reviewService.restoreReview(id);
            return ResponseEntity.ok("Рецензия успешно восстановлена");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при восстановлении рецензии: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/hard-delete")
    @ResponseBody
    public ResponseEntity<String> hardDeleteReview(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            reviewService.hardDeleteReview(id);
            return ResponseEntity.ok("Рецензия безвозвратно удалена");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при удалении рецензии: " + e.getMessage());
        }
    }
} 