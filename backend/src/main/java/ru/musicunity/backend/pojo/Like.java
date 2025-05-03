package ru.musicunity.backend.pojo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Arrays;

@Entity
@Table(name = "likes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Convert(converter = LikeTypeConverter.class)
    private LikeType type;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum LikeType {
        REGULAR(0), AUTHOR(1);

        private final int code;
        LikeType(int code) { this.code = code; }
        public int getCode() { return code; }
    }

    @Converter(autoApply = true)
    public static class LikeTypeConverter implements AttributeConverter<LikeType, Integer> {
        @Override public Integer convertToDatabaseColumn(LikeType type) { return type.getCode(); }
        @Override public LikeType convertToEntityAttribute(Integer code) {
            return Arrays.stream(LikeType.values())
                    .filter(t -> t.getCode() == code)
                    .findFirst()
                    .orElseThrow(IllegalArgumentException::new);
        }
    }
}