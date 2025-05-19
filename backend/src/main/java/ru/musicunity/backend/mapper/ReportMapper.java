package ru.musicunity.backend.mapper;

import org.springframework.stereotype.Component;
import ru.musicunity.backend.dto.ReportDTO;
import ru.musicunity.backend.pojo.Report;

@Component
public class ReportMapper {
    
    public ReportDTO toDTO(Report report) {
        if (report == null) {
            return null;
        }
        
        ReportDTO dto = new ReportDTO();
        dto.setReportId(report.getReportId());
        dto.setReviewId(report.getReview().getReviewId());
        dto.setUserId(report.getUser().getUserId());
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setResolvedAt(report.getResolvedAt());
        
        if (report.getModerator() != null) {
            dto.setModeratorId(report.getModerator().getUserId());
        }
        
        return dto;
    }
    
    public Report toEntity(ReportDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Report report = new Report();
        report.setReportId(dto.getReportId());
        report.setReason(dto.getReason());
        report.setStatus(dto.getStatus());
        report.setCreatedAt(dto.getCreatedAt());
        report.setResolvedAt(dto.getResolvedAt());
        
        return report;
    }
} 