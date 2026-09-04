package com.onepoint.formmanager.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

public class AnalyticsDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardMetrics {
        private long totalForms;
        private long activeForms;
        private long archivedForms;
        private long totalResponses;
        private List<FormDTOs.FormResponse> recentForms;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FormAnalytics {
        private Long formId;
        private String formTitle;
        private long totalSubmissions;
        private long dailySubmissions;
        private long weeklySubmissions;
        private long monthlySubmissions;
        private double completionRate;
        private List<QuestionAnalytics> questionAnalyticsList;
        private Map<String, Long> timelineData; // YYYY-MM-DD -> count
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionAnalytics {
        private Long questionId;
        private String questionText;
        private String questionType;
        private double averageRating; // for RATING/NUMBER
        private Map<String, Long> optionCounts; // option value -> count
        private List<String> textAnswers; // sample text responses
    }
}
