package com.onepoint.formmanager.controller;

import com.onepoint.formmanager.entity.FormTemplate;
import com.onepoint.formmanager.repository.FormTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class FormTemplateController {

    private final FormTemplateRepository templateRepository;

    @GetMapping
    public ResponseEntity<List<FormTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormTemplate> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id)));
    }
}
