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
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.service.ReviewService;

import jakarta.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
public class ReviewAdminController {

    private final ReviewService reviewService;

    @GetMapping
    public String listReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "reviewId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long reviewId,
            @RequestParam(required = false) Long releaseId,
            Model model,
            HttpServletRequest request) {
        
        try {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<ReviewDTO> reviews;
            
            // Фильтр по статусу
            if (status != null && !status.isEmpty()) {
                switch (status) {
                    case "deleted":
                        reviews = reviewService.getAllDeletedReviews(pageable);
                        break;
                    default:
                        reviews = reviewService.getAllSorted(pageable);
                        break;
                }
            } else {
                reviews = reviewService.getAllSorted(pageable);
            }
            
            model.addAttribute("reviews", reviews);
            model.addAttribute("sortBy", sortBy);
            model.addAttribute("sortDir", sortDir);
            model.addAttribute("search", search);
            model.addAttribute("status", status);
            model.addAttribute("reviewId", reviewId);
            model.addAttribute("releaseId", releaseId);
            
            // AJAX-ответ
            if ("XMLHttpRequest".equals(request.getHeader("X-Requested-With"))) {
                return "admin/reviews :: reviewsTable";
            }
            
            return "admin/reviews";
        } catch (Exception e) {
            model.addAttribute("error", "Ошибка при загрузке списка рецензий: " + e.getMessage());
            return "admin/reviews";
        }
    }

    @PostMapping(value = "/{id}/soft-delete", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public ResponseEntity<String> softDeleteReview(@PathVariable Long id) {
        try {
            reviewService.softDeleteReview(id);
            return ResponseEntity.ok("Рецензия скрыта");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при скрытии рецензии: " + e.getMessage());
        }
    }

    @PostMapping(value = "/{id}/restore", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public ResponseEntity<String> restoreReview(@PathVariable Long id) {
        try {
            reviewService.restoreReview(id);
            return ResponseEntity.ok("Рецензия восстановлена");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при восстановлении рецензии: " + e.getMessage());
        }
    }

    @PostMapping(value = "/{id}/hard-delete", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public ResponseEntity<String> hardDeleteReview(@PathVariable Long id) {
        try {
            reviewService.hardDeleteReview(id);
            return ResponseEntity.ok("Рецензия безвозвратно удалена");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при удалении рецензии: " + e.getMessage());
        }
    }
} 