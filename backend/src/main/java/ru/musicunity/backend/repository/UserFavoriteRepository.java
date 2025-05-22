package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Release;
import ru.musicunity.backend.pojo.UserFavorite;

import java.util.List;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UserFavorite.UserFavoriteId> {
    @Query("SELECT uf FROM UserFavorite uf WHERE uf.user.userId = :userId")
    Page<UserFavorite> findByUser(Long userId, Pageable pageable);

    @Query("SELECT uf FROM UserFavorite uf WHERE uf.release.releaseId = :releaseId")
    Page<UserFavorite> findByRelease(Long releaseId, Pageable pageable);

    @Query("SELECT uf.release FROM UserFavorite uf WHERE uf.user.userId = :userId")
    List<Release> findFavoritesByUser(Long userId);
}