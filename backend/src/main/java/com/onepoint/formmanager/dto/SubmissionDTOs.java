package com.onepoint.formmanager.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SubmissionDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmissionRequest {
        @NotNull
        private Long formId;
        private String submissionToken;
        private Boolean isDraft;
        private Boolean sendResponseCopy;
        private String employeeId;
        private String respondentName;
        private String respondentEmail;
        @Builder.Default
        private List<AnswerRequest> answers = new ArrayList<>();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerRequest {
        @NotNull
        private Long questionId;
        private String questionText;
        private String answerValue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmissionResponse {
        private Long id;
        private Long formId;
        private String formTitle;
        private String submissionToken;
        private Boolean isDraft;
        private Boolean isAnonymous;
        private String employeeId;
        private String respondentName;
        private String respondentEmail;
        private LocalDateTime submittedAt;
        private List<AnswerResponse> answers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerResponse {
        private Long id;
        private Long questionId;
        private String questionText;
        private String answerValue;
    }
}
