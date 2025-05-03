package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "authors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Author {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long authorId;

    @Column(unique = true, nullable = false, length = 50)
    private String authorName;

    @Column(nullable = false)
    private Boolean isVerified = false;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String avatarUrl;

    @Lob
    private String bio;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Integer followingCount = 0;

    @Column(nullable = false)
    @Convert(converter = AuthorRoleConverter.class)
    private AuthorRole role;

    @ManyToMany(mappedBy = "authors")
    private List<Release> releases = new ArrayList<>();

    public enum AuthorRole {
        PERFORMER(0), PRODUCER(1), BOTH(2);

        private final int code;
        AuthorRole(int code) { this.code = code; }
        public int getCode() { return code; }
    }

    @Converter(autoApply = true)
    public static class AuthorRoleConverter implements AttributeConverter<AuthorRole, Integer> {
        @Override public Integer convertToDatabaseColumn(AuthorRole role) { return role.getCode(); }
        @Override public AuthorRole convertToEntityAttribute(Integer code) {
            return Arrays.stream(AuthorRole.values())
                    .filter(r -> r.getCode() == code)
                    .findFirst()
                    .orElseThrow(IllegalArgumentException::new);
        }
    }
}