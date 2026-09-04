package com.onepoint.formmanager.util;

import com.onepoint.formmanager.entity.Form;
import com.onepoint.formmanager.entity.FormSubmission;
import com.onepoint.formmanager.entity.Question;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

public class CSVExporter {

    public static ByteArrayInputStream exportSubmissionsToCSV(Form form, List<FormSubmission> submissions) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {

            // Collect all questions ordered
            List<Question> questions = form.getSections().stream()
                    .flatMap(s -> s.getQuestions().stream())
                    .sorted(Comparator.comparing(Question::getOrderIndex))
                    .collect(Collectors.toList());

            // Build Header
            List<String> headers = new ArrayList<>();
            headers.add("Submission ID");
            headers.add("Submission Date");
            headers.add("Employee ID");
            headers.add("Respondent Name");
            headers.add("Respondent Email");

            for (Question q : questions) {
                headers.add(escapeCSV(q.getQuestionText()));
            }

            writer.println(String.join(",", headers));

            // Build Rows
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (FormSubmission sub : submissions) {
                List<String> row = new ArrayList<>();
                row.add(escapeCSV(sub.getSubmissionToken()));
                row.add(escapeCSV(sub.getSubmittedAt() != null ? sub.getSubmittedAt().format(formatter) : ""));
                row.add(escapeCSV(sub.getIsAnonymous() ? "ANONYMOUS" : sub.getEmployeeId()));
                row.add(escapeCSV(sub.getIsAnonymous() ? "ANONYMOUS" : sub.getRespondentName()));
                row.add(escapeCSV(sub.getIsAnonymous() ? "ANONYMOUS" : sub.getRespondentEmail()));

                Map<Long, String> answerMap = sub.getAnswers().stream()
                        .collect(Collectors.toMap(a -> a.getQuestionId(), a -> a.getAnswerValue() != null ? a.getAnswerValue() : "", (v1, v2) -> v1));

                for (Question q : questions) {
                    row.add(escapeCSV(answerMap.getOrDefault(q.getId(), "")));
                }

                writer.println(String.join(",", row));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to export CSV: " + e.getMessage(), e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private static String escapeCSV(String data) {
        if (data == null) return "\"\"";
        String escaped = data.replaceAll("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
