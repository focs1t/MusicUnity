package ru.musicunity.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.repository.UserRepository;
import ru.musicunity.backend.security.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationExceptionHandler authenticationExceptionHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService, userDetailsService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configure(http))
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/registration/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/authors/**").permitAll()
                .requestMatchers("/api/files/**").permitAll()
                .requestMatchers("/api/releases/**").permitAll()
                .requestMatchers("/api/reports/**").permitAll()
                .requestMatchers("/api/likes/**").permitAll()
                .requestMatchers("/api/genres/**").permitAll()
                .requestMatchers("/api/reviews/**").permitAll()
                .requestMatchers("/api/statistics/**").permitAll()
                .requestMatchers("/admin/login", "/css/**", "/js/**").permitAll()
                .requestMatchers("/admin/**").hasAnyRole("ADMIN")
                .requestMatchers("/api/audit/**").hasRole("ADMIN")
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(10) // Максимум 10 сессий на пользователя
                .maxSessionsPreventsLogin(false) // Не блокировать новые сессии
                .sessionRegistry(sessionRegistry())
                .expiredUrl("/admin/login?expired=true")
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(authenticationExceptionHandler)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .formLogin(form -> form
                .loginPage("/admin/login")
                .loginProcessingUrl("/admin/login")
                .defaultSuccessUrl("/admin/dashboard", true)
                .failureUrl("/admin/login?error=true")
                .successHandler((request, response, authentication) -> {
                    try {
                        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                        User user = userDetails.getUser();
                        
                        if (!user.getRights().name().equals("ADMIN")) {
                            SecurityContextHolder.clearContext();
                            // Используем полный URL с учетом заголовков прокси
                            String baseUrl = getRequestBaseUrl(request);
                            response.sendRedirect(baseUrl + "/admin/login?error=access");
                            return;
                        }
                        
                        user.setLastLogin(LocalDateTime.now());
                        userRepository.save(user);
                        // Используем полный URL с учетом заголовков прокси
                        String baseUrl = getRequestBaseUrl(request);
                        response.sendRedirect(baseUrl + "/admin/dashboard");
                    } catch (Exception e) {
                        String baseUrl = getRequestBaseUrl(request);
                        response.sendRedirect(baseUrl + "/admin/login?error=true");
                    }
                })
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/admin/login?logout")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }

    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }
    
    private String getRequestBaseUrl(HttpServletRequest request) {
        // Логирование заголовков для отладки
        System.out.println("=== DEBUG: Request headers ===");
        System.out.println("X-Forwarded-Proto: " + request.getHeader("X-Forwarded-Proto"));
        System.out.println("X-Forwarded-Host: " + request.getHeader("X-Forwarded-Host"));
        System.out.println("X-Forwarded-Port: " + request.getHeader("X-Forwarded-Port"));
        System.out.println("Host: " + request.getHeader("Host"));
        System.out.println("Original URL: " + request.getRequestURL());
        System.out.println("Scheme: " + request.getScheme());
        System.out.println("Server Name: " + request.getServerName());
        System.out.println("Server Port: " + request.getServerPort());
        
        // Проверяем заголовки от ngrok/прокси
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedHost = request.getHeader("X-Forwarded-Host");
        String forwardedPort = request.getHeader("X-Forwarded-Port");
        
        String baseUrl;
        if (forwardedHost != null) {
            String scheme = forwardedProto != null ? forwardedProto : "https";
            String port = "";
            
            // Для HTTPS обычно порт не нужен, для HTTP проверяем
            if (forwardedPort != null && !forwardedPort.equals("80") && !forwardedPort.equals("443")) {
                port = ":" + forwardedPort;
            }
            
            baseUrl = scheme + "://" + forwardedHost + port;
        } else {
            // Fallback к стандартному способу
            baseUrl = request.getScheme() + "://" + request.getServerName() + 
                     (request.getServerPort() != 80 && request.getServerPort() != 443 ? ":" + request.getServerPort() : "");
        }
        
        System.out.println("Calculated base URL: " + baseUrl);
        System.out.println("===============================");
        return baseUrl;
    }
} 