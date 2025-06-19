package ru.musicunity.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.ForwardedHeaderFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public ForwardedHeaderFilter forwardedHeaderFilter() {
        return new ForwardedHeaderFilter();
    }
    
    // Утилитный метод для получения правильного базового URL
    public static String getBaseUrl() {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = attr.getRequest();
        
        // Проверяем заголовки от ngrok/прокси
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedHost = request.getHeader("X-Forwarded-Host");
        String forwardedPort = request.getHeader("X-Forwarded-Port");
        
        if (forwardedHost != null) {
            String scheme = forwardedProto != null ? forwardedProto : "https";
            String port = "";
            
            // Для HTTPS обычно порт не нужен, для HTTP проверяем
            if (forwardedPort != null && !forwardedPort.equals("80") && !forwardedPort.equals("443")) {
                port = ":" + forwardedPort;
            }
            
            return scheme + "://" + forwardedHost + port;
        }
        
        // Fallback к стандартному способу
        return request.getScheme() + "://" + request.getServerName() + 
               (request.getServerPort() != 80 && request.getServerPort() != 443 ? ":" + request.getServerPort() : "");
    }
} 