package ru.musicunity.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.musicunity.backend.dto.*;
import ru.musicunity.backend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserService userService;

    @GetMapping("/search")
    public List<UserShortDto> search(@RequestParam String query,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size) {
        return userService.searchUsers(query, page, size);
    }

    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable Long id) {
        return userService.getUserInfo(id);
    }

    @PutMapping("/{id}")
    public void updateProfile(@PathVariable Long id, @RequestBody UserDto dto) {
        userService.updateProfile(id, dto);
    }

    @PostMapping("/{id}/block")
    public void blockUser(@PathVariable Long id) {
        userService.blockUser(id);
    }

    @GetMapping("/{id}/favorites")
    public List<Long> getFavorites(@PathVariable Long id) {
        return userService.getFavorites(id);
    }

    @GetMapping("/{id}/followings")
    public List<Long> getFollowings(@PathVariable Long id) {
        return userService.getFollowings(id);
    }
}