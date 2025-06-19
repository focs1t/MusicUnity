package ru.musicunity.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class AuthenticationExceptionHandler implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        // Проверяем, является ли запрос API-запросом
        if (request.getRequestURI().startsWith("/api/")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            Map<String, Object> body = new HashMap<>();
            body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
            body.put("error", "Unauthorized");
            body.put("message", authException.getMessage());
            body.put("path", request.getServletPath());

            objectMapper.writeValue(response.getOutputStream(), body);
        } else {
            // Для веб-запросов перенаправляем на страницу входа с учетом ngrok
            String baseUrl = getRequestBaseUrl(request);
            response.sendRedirect(baseUrl + "/admin/login");
                  }
      }
      
      private String getRequestBaseUrl(HttpServletRequest request) {
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