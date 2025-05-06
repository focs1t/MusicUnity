package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import ru.musicunity.backend.pojo.enums.AuthorRole;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    @Convert(converter = AuthorRole.AuthorRoleConverter.class)
    private AuthorRole role;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReleaseAuthor> releases = new ArrayList<>();

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserFollowing> followings = new ArrayList<>();
}