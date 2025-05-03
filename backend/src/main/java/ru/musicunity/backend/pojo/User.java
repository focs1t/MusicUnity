package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastLogin;

    private String avatarUrl;

    @Lob
    private String bio;

    @Column(nullable = false)
    @Convert(converter = UserRoleConverter.class)
    private UserRole rights;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> reports = new ArrayList<>();

    public enum UserRole {
        BLOCKED(-1), REGULAR(0), AUTHOR(1), MODERATOR(2);

        private final int code;
        UserRole(int code) { this.code = code; }
        public int getCode() { return code; }
    }

    @Converter(autoApply = true)
    public static class UserRoleConverter implements AttributeConverter<UserRole, Integer> {
        @Override public Integer convertToDatabaseColumn(UserRole role) { return role.getCode(); }
        @Override public UserRole convertToEntityAttribute(Integer code) {
            return Arrays.stream(UserRole.values())
                    .filter(r -> r.getCode() == code)
                    .findFirst()
                    .orElseThrow(IllegalArgumentException::new);
        }
    }
}