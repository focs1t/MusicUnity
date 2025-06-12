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
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.service.UserService;
import ru.musicunity.backend.service.SessionManager;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.Map;

@Controller
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {
    private final UserService userService;
    private final SessionManager sessionManager;

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
    public ResponseEntity<?> blockUser(@PathVariable Long id, HttpServletRequest request) {
        try {
            userService.banUserAsAdmin(id);
            
            if (isAjaxRequest(request)) {
                return ResponseEntity.ok(Map.of("message", "Пользователь успешно заблокирован"));
            } else {
                // Для обычных запросов возвращаем редирект
                return ResponseEntity.status(302).location(URI.create("/admin/users")).build();
            }
        } catch (Exception e) {
            if (isAjaxRequest(request)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при блокировке пользователя: " + e.getMessage()));
            } else {
                return ResponseEntity.status(302).location(URI.create("/admin/users?error=" + e.getMessage())).build();
            }
        }
    }

    @PostMapping("/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id, HttpServletRequest request) {
        try {
            userService.unbanUser(id);
            
            if (isAjaxRequest(request)) {
                return ResponseEntity.ok(Map.of("message", "Пользователь успешно разблокирован"));
            } else {
                return ResponseEntity.status(302).location(URI.create("/admin/users")).build();
            }
        } catch (Exception e) {
            if (isAjaxRequest(request)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при разблокировке пользователя: " + e.getMessage()));
            } else {
                return ResponseEntity.status(302).location(URI.create("/admin/users?error=" + e.getMessage())).build();
            }
        }
    }

    @PostMapping("/{id}/promote-to-moderator")
    public ResponseEntity<?> promoteToModerator(@PathVariable Long id, HttpServletRequest request) {
        try {
            userService.changeUserRole(id, ru.musicunity.backend.pojo.enums.UserRole.MODERATOR);
            
            if (isAjaxRequest(request)) {
                return ResponseEntity.ok(Map.of("message", "Пользователь получил роль модератора"));
            } else {
                return ResponseEntity.status(302).location(URI.create("/admin/users")).build();
            }
        } catch (Exception e) {
            if (isAjaxRequest(request)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при назначении роли: " + e.getMessage()));
            } else {
                return ResponseEntity.status(302).location(URI.create("/admin/users?error=" + e.getMessage())).build();
            }
        }
    }

    @PostMapping("/{id}/demote-to-user")
    public ResponseEntity<?> demoteToUser(@PathVariable Long id, HttpServletRequest request) {
        try {
            userService.changeUserRole(id, ru.musicunity.backend.pojo.enums.UserRole.USER);
            
            if (isAjaxRequest(request)) {
                return ResponseEntity.ok(Map.of("message", "Пользователь получил роль обычного пользователя"));
            } else {
                return ResponseEntity.status(302).location(URI.create("/admin/users")).build();
            }
        } catch (Exception e) {
            if (isAjaxRequest(request)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при изменении роли: " + e.getMessage()));
            } else {
                return ResponseEntity.status(302).location(URI.create("/admin/users?error=" + e.getMessage())).build();
            }
        }
    }

    @GetMapping("/{id}/sessions/count")
    @ResponseBody
    public ResponseEntity<Integer> getActiveSessionsCount(@PathVariable Long id) {
        try {
            int count = sessionManager.getActiveSessionsCount(id);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(0);
        }
    }

    @PostMapping("/{id}/sessions/invalidate")
    @ResponseBody
    public ResponseEntity<String> invalidateUserSessions(@PathVariable Long id) {
        try {
            sessionManager.invalidateUserSessions(id);
            return ResponseEntity.ok("Сессии пользователя успешно завершены");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при завершении сессий: " + e.getMessage());
        }
    }

    private boolean isAjaxRequest(HttpServletRequest request) {
        return "XMLHttpRequest".equals(request.getHeader("X-Requested-With"));
    }
} 