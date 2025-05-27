package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.repository.UserRepository;

@Component
public class UserMapper {
    
    private final UserRepository userRepository;

    public UserMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setTelegramChatId(user.getTelegramChatId());
        dto.setRights(user.getRights());
        dto.setIsBlocked(user.getIsBlocked());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        
        return dto;
    }
    
    public User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }
        
        User user = new User();
        user.setUserId(dto.getUserId());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setBio(dto.getBio());
        user.setAvatarUrl(dto.getAvatarUrl());
        user.setTelegramChatId(dto.getTelegramChatId());
        user.setRights(dto.getRights());
        user.setIsBlocked(dto.getIsBlocked());
        user.setLastLogin(dto.getLastLogin());
        user.setCreatedAt(dto.getCreatedAt());
        
        // Получаем пароль из базы данных
        if (dto.getUserId() != null) {
            User existingUser = userRepository.findById(dto.getUserId()).orElse(null);
            if (existingUser != null) {
                user.setPasswordHash(existingUser.getPasswordHash());
            }
        }
        
        return user;
    }
} 