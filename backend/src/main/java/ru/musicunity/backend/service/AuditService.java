package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.AuditDTO;
import ru.musicunity.backend.exception.AuditNotFoundException;
import ru.musicunity.backend.mapper.AuditMapper;
import ru.musicunity.backend.pojo.Audit;
import ru.musicunity.backend.pojo.enums.AuditAction;
import ru.musicunity.backend.repository.AuditRepository;
import ru.musicunity.backend.repository.UserRepository;
import ru.musicunity.backend.repository.ReviewRepository;
import ru.musicunity.backend.repository.ReleaseRepository;
import ru.musicunity.backend.repository.AuthorRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository auditRepository;
    private final AuditMapper auditMapper;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ReleaseRepository releaseRepository;
    private final AuthorRepository authorRepository;

    public Page<AuditDTO> getAuditLogsByModerator(Long moderatorId, Pageable pageable) {
        return auditRepository.findByModerator(moderatorId, pageable)
                .map(auditMapper::toDTO);
    }

    public Page<AuditDTO> getAuditLogsByTargetId(Long targetId, Pageable pageable) {
        return auditRepository.findByTargetId(targetId, pageable)
                .map(auditMapper::toDTO);
    }

    public Page<AuditDTO> getAuditLogs(Pageable pageable) {
        return auditRepository.findAllSorted(pageable)
                .map(auditMapper::toDTO);
    }

    public Page<AuditDTO> getAuditLogsByActionType(AuditAction actionType, Pageable pageable) {
        return auditRepository.findByActionType(actionType, pageable)
                .map(auditMapper::toDTO);
    }

    public AuditDTO getAuditLogById(Long id) {
        return auditRepository.findById(id)
                .map(auditMapper::toDTO)
                .orElseThrow(() -> new AuditNotFoundException(id));
    }

    public Page<AuditDTO> getAuditLogsByRollbackStatus(Boolean isRolledBack, Pageable pageable) {
        return auditRepository.findByIsRolledBack(isRolledBack, pageable)
                .map(auditMapper::toDTO);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void rollbackAction(Long auditId) {
        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new AuditNotFoundException(auditId));
        
        // Проверяем, не был ли уже откачен
        if (Boolean.TRUE.equals(audit.getIsRolledBack())) {
            throw new RuntimeException("Действие уже было отменено");
        }
        
        switch (audit.getActionType()) {
            case USER_BLOCK:
                // Разблокируем пользователя
                userRepository.findById(audit.getTargetId()).ifPresent(user -> {
                    user.setIsBlocked(false);
                    userRepository.save(user);
                });
                break;

            case USER_UNBLOCK:
                // Заблокируем пользователя обратно
                userRepository.findById(audit.getTargetId()).ifPresent(user -> {
                    user.setIsBlocked(true);
                    userRepository.save(user);
                });
                break;

            case USER_DELETE:
                // Удаление пользователей не поддерживается в системе
                throw new RuntimeException("Удаление пользователей не предусмотрено в системе");

            case USER_RESTORE:
                // Восстановление пользователей не поддерживается (нет удаления)
                throw new RuntimeException("Восстановление пользователей не предусмотрено в системе");
                
            case REVIEW_DELETE:
                // Восстанавливаем удаленную рецензию (убираем флаг удален)
                reviewRepository.findById(audit.getTargetId()).ifPresent(review -> {
                    review.setIsDeleted(false);
                    reviewRepository.save(review);
                });
                break;

            case REVIEW_RESTORE:
                // Удаляем восстановленную рецензию (ставим флаг удален)
                reviewRepository.findById(audit.getTargetId()).ifPresent(review -> {
                    review.setIsDeleted(true);
                    reviewRepository.save(review);
                });
                break;
                
            case RELEASE_DELETE:
                // Восстанавливаем удаленный релиз (убираем флаг удален)
                releaseRepository.findById(audit.getTargetId()).ifPresent(release -> {
                    release.setIsDeleted(false);
                    releaseRepository.save(release);
                });
                break;

            case RELEASE_RESTORE:
                // Удаляем восстановленный релиз (ставим флаг удален)
                releaseRepository.findById(audit.getTargetId()).ifPresent(release -> {
                    release.setIsDeleted(true);
                    releaseRepository.save(release);
                });
                break;
                
            case AUTHOR_ADD:
                // Для созданного автора устанавливаем флаг удален
                authorRepository.findById(audit.getTargetId()).ifPresent(author -> {
                    author.setIsDeleted(true);
                    authorRepository.save(author);
                });
                break;

            case AUTHOR_DELETE:
                // Восстанавливаем удаленного автора (убираем флаг удален)
                authorRepository.findById(audit.getTargetId()).ifPresent(author -> {
                    author.setIsDeleted(false);
                    authorRepository.save(author);
                });
                break;
                
            case RELEASE_ADD:
            case RELEASE_CREATE_OWN:
                // Для созданного релиза устанавливаем флаг удален
                releaseRepository.findById(audit.getTargetId()).ifPresent(release -> {
                    release.setIsDeleted(true);
                    releaseRepository.save(release);
                });
                break;
                
            case USER_DEMOTE_FROM_MODERATOR:
                // Для понижения модератора возвращаем роль MODERATOR
                userRepository.findById(audit.getTargetId()).ifPresent(user -> {
                    user.setRights(ru.musicunity.backend.pojo.enums.UserRole.MODERATOR);
                    userRepository.save(user);
                });
                break;
                
            default:
                throw new RuntimeException("Откат для действия " + audit.getActionType() + " не поддерживается");
        }
        
        // Устанавливаем флаг отката
        audit.setIsRolledBack(true);
        audit.setRollbackAt(LocalDateTime.now());
        auditRepository.save(audit);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public boolean canRollback(Long auditId) {
        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new AuditNotFoundException(auditId));
        
        // Если уже откачено, то откат невозможен
        if (Boolean.TRUE.equals(audit.getIsRolledBack())) {
            return false;
        }
        
        // Проверяем, поддерживается ли откат для данного типа действия
        switch (audit.getActionType()) {
            case USER_BLOCK:
            case USER_UNBLOCK:
            case REVIEW_DELETE:
            case REVIEW_RESTORE:
            case RELEASE_DELETE:
            case RELEASE_RESTORE:
            case AUTHOR_ADD:
            case AUTHOR_DELETE:
            case RELEASE_ADD:
            case RELEASE_CREATE_OWN:
            case USER_DEMOTE_FROM_MODERATOR:
                return true;
            case USER_DELETE:
            case USER_RESTORE:
                return false; // Удаление/восстановление пользователей не поддерживается в системе
            default:
                return false;
        }
    }
}