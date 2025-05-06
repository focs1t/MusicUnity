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
    List<Audit> findByModerator(Long moderatorId);

    @Query("SELECT * FROM Audit a WHERE a.actionType = :action")
    Page<Audit> findByActionType(AuditAction action, Pageable pageable);

    List<Audit> findByTargetId(Long targetId);
    
    @Query("SELECT a FROM Audit a ORDER BY a.performedAt DESC")
    Page<Audit> findAllOrderByPerformedAtDesc(Pageable pageable);
    
    @Query("SELECT a FROM Audit a ORDER BY a.performedAt ASC")
    Page<Audit> findAllOrderByPerformedAtAsc(Pageable pageable);
    
    void deleteAll();
}