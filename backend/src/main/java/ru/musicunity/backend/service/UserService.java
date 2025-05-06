package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    public void updateTelegramChatId(String username, Long chatId) {
        User user = findByUsername(username);
        if (user != null) {
            user.setTelegramChatId(chatId);
            userRepository.save(user);
        }
    }

    public List<User> findByRights(UserRole role) {
        return userRepository.findByRights(role);
    }

    public User register(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRights(UserRole.REGULAR);

        return userRepository.save(user);
    }

    public User findByTelegramChatId(Long chatId) {
        return userRepository.findByTelegramChatId(chatId)
                .orElse(null);
    }

    public User findModeratorByEmail(String email) {
        return userRepository.findByEmailAndRights(email, UserRole.MODERATOR)
                .orElse(null);
    }

    // TODO список по имени частичному
    // TODO полная инфа о пользователе
    // TODO регистрация
    // TODO авторизация
    // TODO изменение пароля
    // TODO изменение данных
    // TODO блокировка
    // TODO выход
    // TODO список избранного (релизов отдельно по типу)
    // TODO список подписок (авторов отдельно по типу)
}