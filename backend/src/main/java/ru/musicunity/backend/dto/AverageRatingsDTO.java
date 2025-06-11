package ru.musicunity.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AverageRatingsDTO {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingDetails {
        private Double rhymeImagery;
        private Double structureRhythm;
        private Double styleExecution;
        private Double individuality;
        private Double vibe;
    }
    
    private RatingDetails extended;
    private RatingDetails simple;
} 