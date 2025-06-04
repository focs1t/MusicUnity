package ru.musicunity.backend.controller.web;

import jakarta.servlet.http.HttpServletRequest;
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
            Model model,
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false, defaultValue = "asc") String direction,
            HttpServletRequest request) {
        
        Page<UserDTO> users;
        
        // Создаем Pageable с сортировкой
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable sortedPageable = pageable;
        if (sort != null && !sort.isEmpty()) {
            String sortField;
            switch (sort) {
                case "id":
                    sortField = "userId";
                    break;
                case "role":
                    sortField = "rights";
                    break;
                case "status":
                    sortField = "isBlocked";
                    break;
                case "lastLogin":
                    sortField = "lastLogin";
                    break;
                default:
                    sortField = sort;
            }
            sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), 
                Sort.by(sortDirection, sortField));
        }
        
        // Применяем все фильтры последовательно
        if (search != null && !search.isEmpty()) {
            users = userService.findByUsernameContaining(search, sortedPageable);
            if (role != null) {
                users = userService.filterByRole(users, role);
            }
            if ("blocked".equals(status)) {
                users = userService.filterBlocked(users);
            } else if ("active".equals(status)) {
                users = userService.filterActive(users);
            }
        } else if (role != null) {
            users = userService.findByRights(role, sortedPageable);
            if ("blocked".equals(status)) {
                users = userService.filterBlocked(users);
            } else if ("active".equals(status)) {
                users = userService.filterActive(users);
            }
        } else if ("blocked".equals(status)) {
            users = userService.findBlockedUsers(sortedPageable);
            if (role != null) {
                users = userService.filterByRole(users, role);
            }
        } else if ("active".equals(status)) {
            users = userService.findActiveUsers(sortedPageable);
            if (role != null) {
                users = userService.filterByRole(users, role);
            }
        } else {
            users = userService.getAllUsers(sortedPageable);
        }
        
        model.addAttribute("users", users);
        model.addAttribute("title", "Управление пользователями");
        model.addAttribute("activePage", "users");
        model.addAttribute("currentRole", role);
        model.addAttribute("currentStatus", status);
        model.addAttribute("currentSearch", search);
        model.addAttribute("currentSort", sort);
        model.addAttribute("currentDirection", direction);

        // Если это AJAX-запрос, возвращаем только таблицу
        if ("XMLHttpRequest".equals(request.getHeader("X-Requested-With"))) {
            return "admin/users :: #usersTable";
        }
        
        return "admin/users";
    }

    @GetMapping("/blocked")
    public String blockedUsers(Model model, @PageableDefault(size = 10) Pageable pageable) {
        Page<UserDTO> users = userService.findBlockedUsers(pageable);
        model.addAttribute("users", users);
        model.addAttribute("title", "Заблокированные пользователи");
        model.addAttribute("activePage", "users");
        return "admin/users";
    }

    @GetMapping("/role/{role}")
    public String usersByRole(@PathVariable UserRole role, Model model, @PageableDefault(size = 10) Pageable pageable) {
        Page<UserDTO> users = userService.findByRights(role, pageable);
        model.addAttribute("users", users);
        model.addAttribute("title", "Пользователи с ролью " + role);
        model.addAttribute("activePage", "users");
        return "admin/users";
    }

    @PostMapping("/{id}/ban")
    public String banUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        userService.banUser(id);
        redirectAttributes.addFlashAttribute("success", "Пользователь успешно заблокирован");
        return "redirect:/admin/users";
    }

    @PostMapping("/{id}/unban")
    public String unbanUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        userService.unbanUser(id);
        redirectAttributes.addFlashAttribute("success", "Пользователь успешно разблокирован");
        return "redirect:/admin/users";
    }

    @PostMapping("/{id}/role")
    public String changeUserRole(@PathVariable Long id, @RequestParam UserRole role, RedirectAttributes redirectAttributes) {
        userService.changeUserRole(id, role);
        redirectAttributes.addFlashAttribute("success", "Роль пользователя успешно изменена");
        return "redirect:/admin/users";
    }
} 