package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.UserFavorite;

import java.util.List;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UserFavorite.UserFavoriteId> {
    @Query("SELECT uf FROM UserFavorite uf WHERE uf.user.userId = :userId")
    List<UserFavorite> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM UserFavorite uf WHERE uf.user.userId = :userId AND uf.release.releaseId = :releaseId")
    void deleteByUserAndRelease(Long userId, Long releaseId);
}