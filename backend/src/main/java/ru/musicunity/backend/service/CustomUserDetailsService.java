package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.security.UserDetailsImpl;
import ru.musicunity.backend.mapper.UserMapper;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserService userService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userService.getUserByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("Пользователь с именем " + username + " не найден");
        }
        return new UserDetailsImpl(user);
    }
} 