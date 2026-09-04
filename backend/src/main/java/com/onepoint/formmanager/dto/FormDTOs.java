package com.onepoint.formmanager.dto;

import com.onepoint.formmanager.enums.DistributionType;
import com.onepoint.formmanager.enums.FormStatus;
import com.onepoint.formmanager.enums.QuestionType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class FormDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FormRequest {
        @NotBlank(message = "Title is required")
        private String title;
        private String description;
        private FormStatus status;
        private DistributionType distributionType;
        private Boolean allowAnonymous;
        private Integer responseLimit;
        private LocalDateTime startDate;
        private LocalDateTime expiryDate;
        @Builder.Default
        private List<FormSectionRequest> sections = new ArrayList<>();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FormSectionRequest {
        private Long id;
        @NotBlank
        private String sectionTitle;
        private String sectionDescription;
        private Integer orderIndex;
        @Builder.Default
        private List<QuestionRequest> questions = new ArrayList<>();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionRequest {
        private Long id;
        @NotBlank
        private String questionText;
        private String helpText;
        private QuestionType questionType;
        private Boolean required;
        private Integer orderIndex;
        private Integer minRating;
        private Integer maxRating;
        private String validationRegex;
        @Builder.Default
        private List<QuestionOptionRequest> options = new ArrayList<>();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionOptionRequest {
        private Long id;
        @NotBlank
        private String optionLabel;
        @NotBlank
        private String optionValue;
        private Integer orderIndex;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FormResponse {
        private Long id;
        private String title;
        private String description;
        private FormStatus status;
        private DistributionType distributionType;
        private Boolean allowAnonymous;
        private Integer responseLimit;
        private Integer currentResponseCount;
        private LocalDateTime startDate;
        private LocalDateTime expiryDate;
        private String shareToken;
        private String createdByEmployeeId;
        private String createdByName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<FormSectionResponse> sections;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FormSectionResponse {
        private Long id;
        private String sectionTitle;
        private String sectionDescription;
        private Integer orderIndex;
        private List<QuestionResponse> questions;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResponse {
        private Long id;
        private String questionText;
        private String helpText;
        private QuestionType questionType;
        private Boolean required;
        private Integer orderIndex;
        private Integer minRating;
        private Integer maxRating;
        private String validationRegex;
        private List<QuestionOptionResponse> options;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionOptionResponse {
        private Long id;
        private String optionLabel;
        private String optionValue;
        private Integer orderIndex;
    }
}
