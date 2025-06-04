package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import ru.musicunity.backend.dto.ReviewDTO;
import ru.musicunity.backend.service.ReviewService;

@Controller
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReviewAdminController {

    private final ReviewService reviewService;

    @GetMapping("/deleted")
    public String listDeletedReviews(Model model, @PageableDefault(size = 15) Pageable pageable) {
        Page<ReviewDTO> reviews = reviewService.getAllDeletedReviews(pageable);
        model.addAttribute("reviews", reviews);
        model.addAttribute("title", "Удаленные рецензии");
        model.addAttribute("activePage", "reviews");
        return "admin/reviews";
    }

    @GetMapping("/{id}")
    public String viewReview(@PathVariable Long id, Model model) {
        ReviewDTO review = reviewService.getReviewById(id);
        model.addAttribute("review", review);
        model.addAttribute("title", "Просмотр рецензии");
        model.addAttribute("activePage", "reviews");
        return "admin/reviews/details";
    }

    @PostMapping("/{id}/restore")
    public String restoreReview(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        reviewService.restoreReview(id);
        redirectAttributes.addFlashAttribute("success", "Рецензия успешно восстановлена");
        return "redirect:/admin/reviews";
    }

    @PostMapping("/{id}/hard-delete")
    public String hardDeleteReview(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        reviewService.hardDeleteReview(id);
        redirectAttributes.addFlashAttribute("success", "Рецензия успешно удалена без возможности восстановления");
        return "redirect:/admin/reviews";
    }
} 