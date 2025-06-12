package ru.musicunity.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.stereotype.Component;
import ru.musicunity.backend.security.UserDetailsImpl;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Component
@Slf4j
public class SessionManager {
    
    @Autowired
    private ApplicationContext applicationContext;
    
    private SessionRegistry sessionRegistry;

    @PostConstruct
    public void init() {
        try {
            this.sessionRegistry = applicationContext.getBean(SessionRegistry.class);
            log.info("SessionManager initialized successfully");
        } catch (Exception e) {
            log.warn("Failed to initialize SessionRegistry: {}", e.getMessage());
        }
    }

    /**
     * Принудительный выход пользователя из всех сессий
     * @param userId ID пользователя
     */
    public void invalidateUserSessions(Long userId) {
        if (sessionRegistry == null) {
            log.warn("SessionRegistry not available, skipping session invalidation for user {}", userId);
            return;
        }
        
        try {
            List<Object> allPrincipals = sessionRegistry.getAllPrincipals();
            
            for (Object principal : allPrincipals) {
                if (principal instanceof UserDetailsImpl userDetails) {
                    if (userDetails.getUser().getUserId().equals(userId)) {
                        // Получаем все сессии пользователя
                        sessionRegistry.getAllSessions(principal, false)
                                .forEach(sessionInformation -> {
                                    log.info("Invalidating session {} for user {}", 
                                        sessionInformation.getSessionId(), userId);
                                    sessionInformation.expireNow();
                                });
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error invalidating sessions for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Принудительный выход пользователя из всех сессий по имени пользователя
     * @param username имя пользователя
     */
    public void invalidateUserSessionsByUsername(String username) {
        if (sessionRegistry == null) {
            log.warn("SessionRegistry not available, skipping session invalidation for username {}", username);
            return;
        }
        
        try {
            List<Object> allPrincipals = sessionRegistry.getAllPrincipals();
            
            for (Object principal : allPrincipals) {
                if (principal instanceof UserDetailsImpl userDetails) {
                    if (userDetails.getUsername().equals(username)) {
                        sessionRegistry.getAllSessions(principal, false)
                                .forEach(sessionInformation -> {
                                    log.info("Invalidating session {} for username {}", 
                                        sessionInformation.getSessionId(), username);
                                    sessionInformation.expireNow();
                                });
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error invalidating sessions for username {}: {}", username, e.getMessage());
        }
    }

    /**
     * Получить количество активных сессий пользователя
     * @param userId ID пользователя
     * @return количество активных сессий
     */
    public int getActiveSessionsCount(Long userId) {
        if (sessionRegistry == null) {
            log.warn("SessionRegistry not available, returning 0 for user {}", userId);
            return 0;
        }
        
        try {
            List<Object> allPrincipals = sessionRegistry.getAllPrincipals();
            
            for (Object principal : allPrincipals) {
                if (principal instanceof UserDetailsImpl userDetails) {
                    if (userDetails.getUser().getUserId().equals(userId)) {
                        return sessionRegistry.getAllSessions(principal, false).size();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error getting session count for user {}: {}", userId, e.getMessage());
        }
        return 0;
    }
} 