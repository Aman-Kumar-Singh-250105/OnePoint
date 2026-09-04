package com.onepoint.formmanager.service;

import com.onepoint.formmanager.dto.AnalyticsDTOs.*;
import com.onepoint.formmanager.dto.FormDTOs.FormResponse;
import com.onepoint.formmanager.entity.*;
import com.onepoint.formmanager.enums.FormStatus;
import com.onepoint.formmanager.enums.QuestionType;
import com.onepoint.formmanager.repository.FormRepository;
import com.onepoint.formmanager.repository.FormSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final FormRepository formRepository;
    private final FormSubmissionRepository submissionRepository;
    private final FormService formService;

    @Transactional(readOnly = true)
    public DashboardMetrics getDashboardMetrics(User user) {
        long totalForms = formRepository.countByCreatedBy(user);
        long activeForms = formRepository.countByCreatedByAndStatus(user, FormStatus.PUBLISHED);
        long archivedForms = formRepository.countByCreatedByAndStatus(user, FormStatus.ARCHIVED);

        List<Form> userForms = formRepository.findByCreatedByOrderByCreatedAtDesc(user);

        long totalResponses = userForms.stream()
                .mapToLong(f -> submissionRepository.countByFormAndIsDraftFalse(f))
                .sum();

        List<FormResponse> recentForms = userForms.stream()
                .limit(5)
                .map(formService::mapToFormResponse)
                .collect(Collectors.toList());

        return DashboardMetrics.builder()
                .totalForms(totalForms)
                .activeForms(activeForms)
                .archivedForms(archivedForms)
                .totalResponses(totalResponses)
                .recentForms(recentForms)
                .build();
    }

    @Transactional(readOnly = true)
    public FormAnalytics getFormAnalytics(Long formId, User currentUser) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        List<FormSubmission> submissions = submissionRepository.findByFormAndIsDraftFalseOrderBySubmittedAtDesc(form);
        long totalSubmissions = submissions.size();

        LocalDateTime now = LocalDateTime.now();
        long daily = submissionRepository.countSubmissionsSince(form, now.minusDays(1));
        long weekly = submissionRepository.countSubmissionsSince(form, now.minusDays(7));
        long monthly = submissionRepository.countSubmissionsSince(form, now.minusDays(30));

        double completionRate = (form.getResponseLimit() != null && form.getResponseLimit() > 0)
                ? ((double) totalSubmissions / form.getResponseLimit()) * 100.0
                : 100.0;

        // Timeline breakdown
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> timelineData = new TreeMap<>();

        for (int i = 6; i >= 0; i--) {
            String dateKey = LocalDate.now().minusDays(i).format(dayFormatter);
            timelineData.put(dateKey, 0L);
        }

        for (FormSubmission s : submissions) {
            if (s.getSubmittedAt() != null) {
                String key = s.getSubmittedAt().toLocalDate().format(dayFormatter);
                timelineData.put(key, timelineData.getOrDefault(key, 0L) + 1);
            }
        }

        // Question breakdown
        List<QuestionAnalytics> questionAnalyticsList = new ArrayList<>();

        for (FormSection section : form.getSections()) {
            for (Question q : section.getQuestions()) {
                QuestionAnalytics qa = new QuestionAnalytics();
                qa.setQuestionId(q.getId());
                qa.setQuestionText(q.getQuestionText());
                qa.setQuestionType(q.getQuestionType().name());

                List<Answer> answersForQ = submissions.stream()
                        .flatMap(s -> s.getAnswers().stream())
                        .filter(a -> a.getQuestionId().equals(q.getId()))
                        .collect(Collectors.toList());

                if (q.getQuestionType() == QuestionType.RATING || q.getQuestionType() == QuestionType.NUMBER) {
                    double avg = answersForQ.stream()
                            .mapToDouble(a -> {
                                try {
                                    return Double.parseDouble(a.getAnswerValue());
                                } catch (Exception e) {
                                    return 0;
                                }
                            })
                            .filter(val -> val > 0)
                            .average().orElse(0.0);
                    qa.setAverageRating(Math.round(avg * 10.0) / 10.0);
                }

                if (q.getQuestionType() == QuestionType.DROPDOWN || q.getQuestionType() == QuestionType.RADIO || q.getQuestionType() == QuestionType.CHECKBOX) {
                    Map<String, Long> counts = new HashMap<>();
                    for (Answer a : answersForQ) {
                        if (a.getAnswerValue() != null) {
                            String[] choices = a.getAnswerValue().split(",");
                            for (String c : choices) {
                                String clean = c.trim();
                                if (!clean.isEmpty()) {
                                    counts.put(clean, counts.getOrDefault(clean, 0L) + 1);
                                }
                            }
                        }
                    }
                    qa.setOptionCounts(counts);
                }

                if (q.getQuestionType() == QuestionType.TEXT || q.getQuestionType() == QuestionType.MULTILINE_TEXT || q.getQuestionType() == QuestionType.EMAIL) {
                    List<String> samples = answersForQ.stream()
                            .map(Answer::getAnswerValue)
                            .filter(val -> val != null && !val.isBlank())
                            .limit(10)
                            .collect(Collectors.toList());
                    qa.setTextAnswers(samples);
                }

                questionAnalyticsList.add(qa);
            }
        }

        return FormAnalytics.builder()
                .formId(form.getId())
                .formTitle(form.getTitle())
                .totalSubmissions(totalSubmissions)
                .dailySubmissions(daily)
                .weeklySubmissions(weekly)
                .monthlySubmissions(monthly)
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .questionAnalyticsList(questionAnalyticsList)
                .timelineData(timelineData)
                .build();
    }
}
