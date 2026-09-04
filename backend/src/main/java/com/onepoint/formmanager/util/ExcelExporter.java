package com.onepoint.formmanager.util;

import com.onepoint.formmanager.entity.Form;
import com.onepoint.formmanager.entity.FormSubmission;
import com.onepoint.formmanager.entity.Question;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

public class ExcelExporter {

    public static ByteArrayInputStream exportSubmissionsToExcel(Form form, List<FormSubmission> submissions) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Responses");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Collect questions
            List<Question> questions = form.getSections().stream()
                    .flatMap(s -> s.getQuestions().stream())
                    .sorted(Comparator.comparing(Question::getOrderIndex))
                    .collect(Collectors.toList());

            Row headerRow = sheet.createRow(0);
            String[] fixedHeaders = {"Submission Token", "Submitted At", "Employee ID", "Respondent Name", "Respondent Email"};

            int colIdx = 0;
            for (String h : fixedHeaders) {
                Cell cell = headerRow.createCell(colIdx++);
                cell.setCellValue(h);
                cell.setCellStyle(headerStyle);
            }

            for (Question q : questions) {
                Cell cell = headerRow.createCell(colIdx++);
                cell.setCellValue(q.getQuestionText());
                cell.setCellStyle(headerStyle);
            }

            // Populate rows
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            int rowIdx = 1;

            for (FormSubmission sub : submissions) {
                Row row = sheet.createRow(rowIdx++);
                int cellIdx = 0;

                row.createCell(cellIdx++).setCellValue(sub.getSubmissionToken());
                row.createCell(cellIdx++).setCellValue(sub.getSubmittedAt() != null ? sub.getSubmittedAt().format(formatter) : "");
                row.createCell(cellIdx++).setCellValue(sub.getIsAnonymous() ? "ANONYMOUS" : (sub.getEmployeeId() != null ? sub.getEmployeeId() : "N/A"));
                row.createCell(cellIdx++).setCellValue(sub.getIsAnonymous() ? "ANONYMOUS" : (sub.getRespondentName() != null ? sub.getRespondentName() : "N/A"));
                row.createCell(cellIdx++).setCellValue(sub.getIsAnonymous() ? "ANONYMOUS" : (sub.getRespondentEmail() != null ? sub.getRespondentEmail() : "N/A"));

                Map<Long, String> answerMap = sub.getAnswers().stream()
                        .collect(Collectors.toMap(a -> a.getQuestionId(), a -> a.getAnswerValue() != null ? a.getAnswerValue() : "", (v1, v2) -> v1));

                for (Question q : questions) {
                    row.createCell(cellIdx++).setCellValue(answerMap.getOrDefault(q.getId(), ""));
                }
            }

            for (int i = 0; i < fixedHeaders.length + questions.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel report: " + e.getMessage(), e);
        }
    }
}
