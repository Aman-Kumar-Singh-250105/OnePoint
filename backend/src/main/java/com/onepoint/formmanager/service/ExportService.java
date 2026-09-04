package com.onepoint.formmanager.service;

import com.onepoint.formmanager.entity.Form;
import com.onepoint.formmanager.entity.FormSubmission;
import com.onepoint.formmanager.repository.FormRepository;
import com.onepoint.formmanager.repository.FormSubmissionRepository;
import com.onepoint.formmanager.util.CSVExporter;
import com.onepoint.formmanager.util.ExcelExporter;
import com.onepoint.formmanager.util.PDFExporter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final FormRepository formRepository;
    private final FormSubmissionRepository submissionRepository;

    public ByteArrayInputStream exportToCSV(Long formId) {
        Form form = getForm(formId);
        List<FormSubmission> submissions = submissionRepository.findByFormAndIsDraftFalseOrderBySubmittedAtDesc(form);
        return CSVExporter.exportSubmissionsToCSV(form, submissions);
    }

    public ByteArrayInputStream exportToExcel(Long formId) {
        Form form = getForm(formId);
        List<FormSubmission> submissions = submissionRepository.findByFormAndIsDraftFalseOrderBySubmittedAtDesc(form);
        return ExcelExporter.exportSubmissionsToExcel(form, submissions);
    }

    public ByteArrayInputStream exportToPDF(Long formId) {
        Form form = getForm(formId);
        List<FormSubmission> submissions = submissionRepository.findByFormAndIsDraftFalseOrderBySubmittedAtDesc(form);
        return PDFExporter.exportSubmissionsToPDF(form, submissions);
    }

    private Form getForm(Long formId) {
        return formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found with id: " + formId));
    }
}
