package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.dto.*;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.UserFavorite;
import ru.musicunity.backend.pojo.UserFollowing;
import ru.musicunity.backend.repository.UserRepository;
import ru.musicunity.backend.repository.UserFavoriteRepository;
import ru.musicunity.backend.repository.UserFollowingRepository;
import ru.musicunity.backend.config.JwtUtil;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final UserFollowingRepository userFollowingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Список пользователей по частичному имени
    public List<UserShortDto> searchUsers(String query, int page, int size) {
        return userRepository.searchUsers(query, PageRequest.of(page, size))
                .stream().map(this::toShortDto).collect(Collectors.toList());
    }

    // Полная инфа о пользователе
    public UserDto getUserInfo(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return toDto(user);
    }

    // Регистрация
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()) || userRepository.existsByUsername(request.getUsername()))
            throw new RuntimeException("User already exists");
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rights(User.UserRole.REGULAR)
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }

    // Авторизация
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
            throw new RuntimeException("Invalid credentials");
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }

    // Изменение пароля
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash()))
            throw new RuntimeException("Wrong old password");
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Изменение данных пользователя
    public void updateProfile(Long userId, UserDto dto) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setAvatarUrl(dto.getAvatarUrl());
        user.setBio(dto.getBio());
        userRepository.save(user);
    }

    // Блокировка пользователя
    public void blockUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setRights(User.UserRole.BLOCKED);
        userRepository.save(user);
    }

    // Выход — на клиенте (JWT)
    public void logout() {
        // JWT logout реализуется на клиенте (удалить токен)
    }

    // Список избранного (релизы)
    public List<Long> getFavorites(Long userId) {
        return userFavoriteRepository.findFavoritesByUser(userId)
                .stream().map(r -> r.getReleaseId()).collect(Collectors.toList());
    }

    // Список подписок (авторы)
    public List<Long> getFollowings(Long userId) {
        return userFollowingRepository.findByFollower(userId, PageRequest.of(0, 100))
                .stream().map(f -> f.getId().getFollowedId()).collect(Collectors.toList());
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setBio(user.getBio());
        dto.setRights(user.getRights().name());
        return dto;
    }

    private UserShortDto toShortDto(User user) {
        UserShortDto dto = new UserShortDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        return dto;
    }
}