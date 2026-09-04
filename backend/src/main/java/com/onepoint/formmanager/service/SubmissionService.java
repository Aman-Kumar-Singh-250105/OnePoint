package com.onepoint.formmanager.service;

import com.onepoint.formmanager.dto.SubmissionDTOs.*;
import com.onepoint.formmanager.entity.*;
import com.onepoint.formmanager.enums.FormStatus;
import com.onepoint.formmanager.repository.FormRepository;
import com.onepoint.formmanager.repository.FormSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final FormRepository formRepository;
    private final FormSubmissionRepository submissionRepository;
    private final EmailService emailService;

    @Transactional
    public SubmissionResponse submitForm(SubmissionRequest request, User authenticatedUser) {
        Form form = formRepository.findById(request.getFormId())
                .orElseThrow(() -> new RuntimeException("Form not found with id: " + request.getFormId()));

        // Validate Status & Dates
        if (form.getStatus() != FormStatus.PUBLISHED && !Boolean.TRUE.equals(request.getIsDraft())) {
            throw new RuntimeException("Form is not currently active for submissions (Status: " + form.getStatus() + ")");
        }

        LocalDateTime now = LocalDateTime.now();
        if (form.getStartDate() != null && now.isBefore(form.getStartDate())) {
            throw new RuntimeException("Form submissions have not opened yet.");
        }

        if (form.getExpiryDate() != null && now.isAfter(form.getExpiryDate())) {
            form.setStatus(FormStatus.EXPIRED);
            formRepository.save(form);
            throw new RuntimeException("Form has expired.");
        }

        // Validate Response Limits
        if (!Boolean.TRUE.equals(request.getIsDraft()) && form.getResponseLimit() != null && form.getResponseLimit() > 0) {
            if (form.getCurrentResponseCount() >= form.getResponseLimit()) {
                form.setStatus(FormStatus.EXPIRED);
                formRepository.save(form);
                emailService.sendLimitReachedAlert(form.getCreatedBy().getEmail(), form.getTitle(), form.getResponseLimit());
                throw new RuntimeException("This form has reached its maximum response limit.");
            }
        }

        FormSubmission submission;
        if (request.getSubmissionToken() != null && !request.getSubmissionToken().isBlank()) {
            submission = submissionRepository.findBySubmissionToken(request.getSubmissionToken())
                    .orElseGet(FormSubmission::new);
        } else {
            submission = new FormSubmission();
            submission.setSubmissionToken(UUID.randomUUID().toString().replaceAll("-", "").substring(0, 16));
        }

        submission.setForm(form);
        submission.setIsDraft(Boolean.TRUE.equals(request.getIsDraft()));
        submission.setIsAnonymous(Boolean.TRUE.equals(form.getAllowAnonymous()));

        if (Boolean.TRUE.equals(form.getAllowAnonymous())) {
            submission.setEmployeeId(null);
            submission.setRespondentName(null);
            submission.setRespondentEmail(null);
        } else if (authenticatedUser != null) {
            submission.setEmployeeId(authenticatedUser.getEmployeeId());
            submission.setRespondentName(authenticatedUser.getFullName());
            submission.setRespondentEmail(authenticatedUser.getEmail());
        } else {
            submission.setEmployeeId(request.getEmployeeId());
            submission.setRespondentName(request.getRespondentName());
            submission.setRespondentEmail(request.getRespondentEmail());
        }

        submission.getAnswers().clear();

        if (request.getAnswers() != null) {
            Map<Long, String> questionTextMap = form.getSections().stream()
                    .filter(s -> s.getQuestions() != null)
                    .flatMap(s -> s.getQuestions().stream())
                    .collect(Collectors.toMap(
                            Question::getId,
                            q -> q.getQuestionText() != null ? q.getQuestionText() : "",
                            (existing, replacement) -> existing
                    ));

            for (AnswerRequest ar : request.getAnswers()) {
                Answer answer = new Answer();
                answer.setSubmission(submission);
                answer.setQuestionId(ar.getQuestionId());
                
                String qText = ar.getQuestionText();
                if (qText == null || qText.isBlank()) {
                    qText = questionTextMap.getOrDefault(ar.getQuestionId(), "Question #" + ar.getQuestionId());
                }
                answer.setQuestionText(qText);
                answer.setAnswerValue(ar.getAnswerValue());
                submission.getAnswers().add(answer);
            }
        }

        FormSubmission saved = submissionRepository.save(submission);

        if (!saved.getIsDraft()) {
            form.setCurrentResponseCount(form.getCurrentResponseCount() + 1);
            if (form.getResponseLimit() != null && form.getCurrentResponseCount() >= form.getResponseLimit()) {
                form.setStatus(FormStatus.EXPIRED);
                emailService.sendLimitReachedAlert(form.getCreatedBy().getEmail(), form.getTitle(), form.getResponseLimit());
            }
            formRepository.save(form);

            // Send Emails
            if (Boolean.TRUE.equals(request.getSendResponseCopy()) && saved.getRespondentEmail() != null) {
                emailService.sendSubmissionConfirmation(saved.getRespondentEmail(), form.getTitle(), saved.getSubmissionToken());
            }

            emailService.sendCreatorResponseAlert(form.getCreatedBy().getEmail(), form.getTitle(),
                    saved.getIsAnonymous() ? "Anonymous Respondent" : saved.getRespondentName());
        }

        return mapToSubmissionResponse(saved);
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionByToken(String token) {
        FormSubmission sub = submissionRepository.findBySubmissionToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid draft or submission token"));
        return mapToSubmissionResponse(sub);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getFormSubmissions(Long formId, User currentUser) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        return submissionRepository.findByFormAndIsDraftFalseOrderBySubmittedAtDesc(form).stream()
                .map(this::mapToSubmissionResponse)
                .collect(Collectors.toList());
    }

    public SubmissionResponse mapToSubmissionResponse(FormSubmission sub) {
        List<AnswerResponse> answerResponses = sub.getAnswers().stream().map(a ->
                AnswerResponse.builder()
                        .id(a.getId())
                        .questionId(a.getQuestionId())
                        .questionText(a.getQuestionText())
                        .answerValue(a.getAnswerValue())
                        .build()
        ).collect(Collectors.toList());

        return SubmissionResponse.builder()
                .id(sub.getId())
                .formId(sub.getForm().getId())
                .formTitle(sub.getForm().getTitle())
                .submissionToken(sub.getSubmissionToken())
                .isDraft(sub.getIsDraft())
                .isAnonymous(sub.getIsAnonymous())
                .employeeId(sub.getIsAnonymous() ? "ANONYMOUS" : sub.getEmployeeId())
                .respondentName(sub.getIsAnonymous() ? "Anonymous Respondent" : sub.getRespondentName())
                .respondentEmail(sub.getIsAnonymous() ? "ANONYMOUS" : sub.getRespondentEmail())
                .submittedAt(sub.getSubmittedAt())
                .answers(answerResponses)
                .build();
    }
}
