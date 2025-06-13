package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    @GetMapping("/login")
    public String login(@RequestParam(required = false) String error, Model model) {
        if (error != null) {
            if ("access".equals(error)) {
                model.addAttribute("errorMessage", "У вас нет прав для доступа к админ-панели");
            } else {
                model.addAttribute("errorMessage", "Неверное имя пользователя или пароль");
            }
        }
        return "admin/login";
    }
    
    @GetMapping
    public String index() {
        return "redirect:/admin/dashboard";
    }
    
    @GetMapping("/dashboard")
    public String dashboard(Model model, Authentication authentication) {
        System.out.println("=== DASHBOARD DEBUG ===");
        System.out.println("Authentication: " + authentication);
        if (authentication != null) {
            System.out.println("Principal: " + authentication.getPrincipal());
            System.out.println("Authorities: " + authentication.getAuthorities());
            System.out.println("Name: " + authentication.getName());
        }
        System.out.println("========================");
        
        model.addAttribute("title", "Админ-панель");
        model.addAttribute("activePage", "dashboard");
        return "admin/dashboard";
    }
} 