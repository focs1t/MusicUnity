package ru.musicunity.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.musicunity.backend.pojo.Audit;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long>, JpaSpecificationExecutor<Audit> {
    @Query("SELECT * FROM Audit a WHERE a.userId = :moderatorId")
    Page<Audit> findByModerator(Long moderatorId, Pageable pageable);

    @Query("SELECT * FROM Audit a WHERE a.actionType = :action")
    Page<Audit> findByActionType(Audit.AuditAction action, Pageable pageable);
}