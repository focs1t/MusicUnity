package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.service.UserService;

@Controller
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class UserAdminController {
    private final UserService userService;

    @GetMapping
    public String users(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            Model model) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserDTO> users = userService.searchUsers(username, role, status, pageable);
        
        model.addAttribute("users", users);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", users.getTotalPages());
        model.addAttribute("sortBy", sortBy);
        model.addAttribute("sortDir", sortDir);
        model.addAttribute("username", username);
        model.addAttribute("role", role);
        model.addAttribute("status", status);
        model.addAttribute("roles", UserRole.values());
        
        return "admin/users";
    }

    @GetMapping("/api")
    @ResponseBody
    public Page<UserDTO> getUsersApi(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return userService.searchUsers(username, role, status, pageable);
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

    @PostMapping("/{id}/promote-to-moderator")
    public String promoteToModerator(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userService.changeUserRole(id, ru.musicunity.backend.pojo.enums.UserRole.MODERATOR);
            redirectAttributes.addFlashAttribute("success", "Пользователь получил роль модератора");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Ошибка при назначении роли: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/{id}/demote-to-user")
    public String demoteToUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userService.changeUserRole(id, ru.musicunity.backend.pojo.enums.UserRole.USER);
            redirectAttributes.addFlashAttribute("success", "Пользователь получил роль обычного пользователя");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Ошибка при изменении роли: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }
} 