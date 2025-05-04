package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import ru.musicunity.backend.dto.*;
import ru.musicunity.backend.pojo.Audit;
import ru.musicunity.backend.repository.*;
import ru.musicunity.backend.exception.AuditNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository auditRepository;
    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final ReleaseRepository releaseRepository;
    private final ReviewRepository reviewRepository;
    private final LikeRepository likeRepository;

    public List<AuditDto> getNewest(int page, int size) {
        return auditRepository.findAll(PageRequest.of(page, size))
                .stream().map(a -> {
                    AuditDto dto = new AuditDto();
                    dto.setLogId(a.getLogId());
                    dto.setModeratorId(a.getModerator().getUserId());
                    dto.setActionType(a.getActionType().name());
                    dto.setTargetId(a.getTargetId());
                    dto.setPerformedAt(a.getPerformedAt());
                    return dto;
                }).collect(Collectors.toList());
    }

    public void clearAll() {
        auditRepository.deleteAll();
    }

    // Список с сортировкой по дате (старые)
    public List<AuditDto> getOldest(int page, int size) {
        return auditRepository.findAll(PageRequest.of(page, size).withSort(Sort.by("performedAt").ascending()))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Список по модератору
    public List<AuditDto> getByModerator(Long moderatorId, int page, int size) {
        return auditRepository.findByModerator(moderatorId, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Список по типу действия
    public List<AuditDto> getByActionType(String actionType, int page, int size) {
        return auditRepository.findByActionType(Audit.AuditAction.valueOf(actionType), PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // Получить аудит по id
    public AuditDto getAudit(Long id) {
        return auditRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new AuditNotFoundException(id));
    }

    private AuditDto toDto(Audit a) {
        AuditDto dto = new AuditDto();
        dto.setLogId(a.getLogId());
        dto.setModeratorId(a.getModerator().getUserId());
        dto.setActionType(a.getActionType().name());
        dto.setTargetId(a.getTargetId());
        dto.setPerformedAt(a.getPerformedAt());
        return dto;
    }

    public SiteStatsDto getSiteStats() {
        return new SiteStatsDto(
            userRepository.count(),
            authorRepository.count(),
            releaseRepository.count(),
            reviewRepository.count(),
            likeRepository.count()
        );
    }
}
