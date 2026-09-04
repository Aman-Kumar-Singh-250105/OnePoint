package com.onepoint.formmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class RuleEngineDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RuleGenerationRequest {
        @NotBlank(message = "Prompt text is required")
        private String prompt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RuleGenerationResponse {
        private String prompt;
        private String matchedCategory;
        private FormDTOs.FormRequest generatedForm;
        private String explanation;
    }
}
