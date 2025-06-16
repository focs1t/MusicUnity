package ru.musicunity.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
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
        
        // Разрешаем все заголовки в ответах
        config.setExposedHeaders(Collections.singletonList("*"));
        
        // Разрешаем передачу учетных данных (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Увеличиваем время кеширования CORS до 24 часов
        config.setMaxAge(86400L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
} 