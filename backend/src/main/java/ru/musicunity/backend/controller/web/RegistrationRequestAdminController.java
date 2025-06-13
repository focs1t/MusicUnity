package ru.musicunity.backend.controller.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import ru.musicunity.backend.dto.RegistrationRequestDTO;
import ru.musicunity.backend.pojo.enums.RequestStatus;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.security.UserDetailsImpl;
import ru.musicunity.backend.service.RegistrationRequestService;

@Controller
@RequestMapping("/admin/registration-requests")
@RequiredArgsConstructor
@Slf4j
public class RegistrationRequestAdminController {

    private final RegistrationRequestService registrationRequestService;

    @GetMapping
    public String showRegistrationRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            Model model) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<RegistrationRequestDTO> requests;
        
        if (status != null && !status.isEmpty()) {
            RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
            requests = registrationRequestService.getRequestsByStatus(requestStatus, pageable);
        } else {
            requests = registrationRequestService.getAllRequests(pageable);
        }
        
        model.addAttribute("requests", requests);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", requests.getTotalPages());
        model.addAttribute("currentStatus", status);
        model.addAttribute("statuses", RequestStatus.values());
        model.addAttribute("activePage", "registration-requests");
        
        return "admin/registration-requests";
    }

    @PostMapping("/{requestId}/approve")
    public String approveRequest(
            @PathVariable Long requestId,
            @RequestParam(required = false) String adminComment,
            RedirectAttributes redirectAttributes) {
        
        try {
            // Получаем email текущего админа
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = null;
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                User user = userDetails.getUser();
                adminEmail = user.getEmail();
            }
            
            registrationRequestService.approveRequest(requestId, adminComment, adminEmail);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Заявка одобрена. Пользователь и автор созданы, отправлено уведомление на email.");
                
        } catch (Exception e) {
            log.error("Ошибка при одобрении заявки {}: {}", requestId, e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", 
                "Ошибка при одобрении заявки: " + e.getMessage());
        }
        
        return "redirect:/admin/registration-requests";
    }

    @PostMapping("/{requestId}/reject")
    public String rejectRequest(
            @PathVariable Long requestId,
            @RequestParam String adminComment,
            RedirectAttributes redirectAttributes) {
        
        try {
            // Получаем email текущего админа
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = null;
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                User user = userDetails.getUser();
                adminEmail = user.getEmail();
            }
            
            registrationRequestService.rejectRequest(requestId, adminComment, adminEmail);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Заявка отклонена, отправлено уведомление на email пользователя.");
                
        } catch (Exception e) {
            log.error("Ошибка при отклонении заявки {}: {}", requestId, e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", 
                "Ошибка при отклонении заявки: " + e.getMessage());
        }
        
        return "redirect:/admin/registration-requests";
    }
} 