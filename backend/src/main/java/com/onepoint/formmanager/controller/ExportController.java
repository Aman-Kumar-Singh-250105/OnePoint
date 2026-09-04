package com.onepoint.formmanager.controller;

import com.onepoint.formmanager.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/form/{formId}/csv")
    public ResponseEntity<InputStreamResource> exportCSV(@PathVariable Long formId) {
        ByteArrayInputStream in = exportService.exportToCSV(formId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=form_" + formId + "_responses.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/form/{formId}/excel")
    public ResponseEntity<InputStreamResource> exportExcel(@PathVariable Long formId) {
        ByteArrayInputStream in = exportService.exportToExcel(formId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=form_" + formId + "_responses.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/form/{formId}/pdf")
    public ResponseEntity<InputStreamResource> exportPDF(@PathVariable Long formId) {
        ByteArrayInputStream in = exportService.exportToPDF(formId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=form_" + formId + "_responses.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(in));
    }
}
