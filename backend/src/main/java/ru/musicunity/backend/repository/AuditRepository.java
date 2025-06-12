package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Audit;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.enums.AuditAction;

import java.util.List;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long>, JpaSpecificationExecutor<Audit> {
    @Query("SELECT a FROM Audit a WHERE a.moderator.userId = :moderatorId")
    Page<Audit> findByModerator(Long moderatorId, Pageable pageable);

    @Query("SELECT a FROM Audit a WHERE a.actionType = :action")
    Page<Audit> findByActionType(AuditAction action, Pageable pageable);

    Page<Audit> findByTargetId(Long targetId, Pageable pageable);
    
    Page<Audit> findByIsRolledBack(Boolean isRolledBack, Pageable pageable);
    
    // Комбинированные методы с фильтром isRolledBack
    @Query("SELECT a FROM Audit a WHERE a.actionType = :actionType AND a.isRolledBack = :isRolledBack")
    Page<Audit> findByActionTypeAndIsRolledBack(AuditAction actionType, Boolean isRolledBack, Pageable pageable);
    
    @Query("SELECT a FROM Audit a WHERE a.targetId = :targetId AND a.isRolledBack = :isRolledBack")
    Page<Audit> findByTargetIdAndIsRolledBack(Long targetId, Boolean isRolledBack, Pageable pageable);
    
    @Query("SELECT a FROM Audit a")
    Page<Audit> findAllSorted(Pageable pageable);
    
    // Найти все записи аудита конкретного модератора с определенным статусом отката
    List<Audit> findByModeratorAndIsRolledBack(User moderator, Boolean isRolledBack);
}