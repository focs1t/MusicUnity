package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.service.UserService;
import org.springframework.data.domain.Pageable;

@Controller
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class UserAdminController {
    private final UserService userService;

    @GetMapping
    public String users(Model model, @PageableDefault(size = 10) Pageable pageable) {
        Page<UserDTO> users = userService.getAllUsers(pageable);
        model.addAttribute("users", users);
        return "admin/users";
    }

    @PostMapping("/{id}/block")
    public String blockUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userService.banUserAsAdmin(id);
            redirectAttributes.addFlashAttribute("success", "Пользователь успешно заблокирован");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Ошибка при блокировке пользователя: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/{id}/unblock")
    public String unblockUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userService.unbanUser(id);
            redirectAttributes.addFlashAttribute("success", "Пользователь успешно разблокирован");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Ошибка при разблокировке пользователя: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }
} 