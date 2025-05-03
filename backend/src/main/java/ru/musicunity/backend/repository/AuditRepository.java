package ru.musicunity.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Audit;

import java.util.List;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long> {
    @Query("SELECT a FROM Audit a WHERE a.moderator.userId = :moderatorId")
    List<Audit> findByModeratorId(Long moderatorId);

    @Query("SELECT a FROM Audit a WHERE a.actionType = :action")
    List<Audit> findByActionType(Audit.AuditAction action);
}