package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.UserDTO;
import ru.musicunity.backend.mapper.AuthorMapper;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.ReviewType;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.repository.UserRepository;

@Component
public class UserMapper {
    
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;

    public UserMapper(UserRepository userRepository, ReviewRepository reviewRepository, 
                     AuthorRepository authorRepository, AuthorMapper authorMapper) {
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.authorRepository = authorRepository;
        this.authorMapper = authorMapper;
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
        
        // Добавляем статистику рецензий
        Long totalReviews = reviewRepository.countByUser(user.getUserId());
        Long extendedReviews = reviewRepository.countByUserAndType(user.getUserId(), ReviewType.EXTENDED);
        Long simpleReviews = reviewRepository.countByUserAndType(user.getUserId(), ReviewType.SIMPLE);
        
        dto.setTotalReviewsCount(totalReviews);
        dto.setExtendedReviewsCount(extendedReviews);
        dto.setSimpleReviewsCount(simpleReviews);
        
        // Добавляем информацию о привязанном авторе
        authorRepository.findByUserUserId(user.getUserId())
                .ifPresent(author -> dto.setLinkedAuthor(authorMapper.toDTO(author)));
        
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