package ru.musicunity.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;
import java.util.Collections;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Разрешаем запросы с localhost и IP-адресов
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://192.168.31.31:3000");
        config.addAllowedOrigin("http://26.179.22.134:3000");
        
        // Разрешаем все HTTP методы
        config.addAllowedMethod("*");
        
        // Разрешаем все заголовки
        config.addAllowedHeader("*");
        
        // Добавляем все стандартные заголовки в exposed headers
        config.setExposedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "Content-Disposition", 
            "Content-Length", 
            "X-Requested-With",
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Headers", 
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Credentials",
            "Access-Control-Max-Age",
            "Cache-Control", 
            "Pragma", 
            "Expires",
            "Location",
            "Accept",
            "Accept-Encoding",
            "Accept-Language",
            "Host",
            "Origin",
            "Referer",
            "Connection",
            "User-Agent",
            "X-CSRF-Token",
            "X-Total-Count",
            "X-Total-Pages",
            "X-Current-Page",
            "X-Page-Size"
        ));
        
        // Разрешаем передачу учетных данных (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Увеличиваем время кеширования CORS до 24 часов
        config.setMaxAge(86400L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
} 