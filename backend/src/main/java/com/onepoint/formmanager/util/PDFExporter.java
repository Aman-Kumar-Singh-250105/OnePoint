package com.onepoint.formmanager.util;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.onepoint.formmanager.entity.Form;
import com.onepoint.formmanager.entity.FormSubmission;
import com.onepoint.formmanager.entity.Question;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class PDFExporter {

    public static ByteArrayInputStream exportSubmissionsToPDF(Form form, List<FormSubmission> submissions) {
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Paragraph title = new Paragraph("OnePoint - Form Response Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.GRAY);
            Paragraph formTitle = new Paragraph("Form: " + form.getTitle() + " | Total Submissions: " + submissions.size(), subTitleFont);
            formTitle.setAlignment(Element.ALIGN_CENTER);
            formTitle.setSpacingAfter(15);
            document.add(formTitle);

            List<Question> questions = form.getSections().stream()
                    .flatMap(s -> s.getQuestions().stream())
                    .sorted(Comparator.comparing(Question::getOrderIndex))
                    .collect(Collectors.toList());

            int colCount = 3 + questions.size();
            PdfPTable table = new PdfPTable(colCount);
            table.setWidthPercentage(100);

            // Header Cells
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"Token", "Respondent", "Submitted At"};

            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headFont));
                cell.setBackgroundColor(new Color(15, 23, 42)); // Slate Navy
                cell.setPadding(6);
                table.addCell(cell);
            }

            for (Question q : questions) {
                PdfPCell cell = new PdfPCell(new Phrase(q.getQuestionText(), headFont));
                cell.setBackgroundColor(new Color(15, 23, 42));
                cell.setPadding(6);
                table.addCell(cell);
            }

            // Data Cells
            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            for (FormSubmission sub : submissions) {
                table.addCell(new Phrase(sub.getSubmissionToken(), dataFont));
                String respondent = sub.getIsAnonymous() ? "Anonymous" : (sub.getRespondentName() != null ? sub.getRespondentName() : sub.getEmployeeId());
                table.addCell(new Phrase(respondent, dataFont));
                table.addCell(new Phrase(sub.getSubmittedAt() != null ? sub.getSubmittedAt().format(formatter) : "", dataFont));

                Map<Long, String> answerMap = sub.getAnswers().stream()
                        .collect(Collectors.toMap(a -> a.getQuestionId(), a -> a.getAnswerValue() != null ? a.getAnswerValue() : "", (v1, v2) -> v1));

                for (Question q : questions) {
                    table.addCell(new Phrase(answerMap.getOrDefault(q.getId(), ""), dataFont));
                }
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Failed to export PDF: " + e.getMessage(), e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
