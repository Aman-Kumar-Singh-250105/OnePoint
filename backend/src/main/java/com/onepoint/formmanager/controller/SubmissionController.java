package com.onepoint.formmanager.controller;

import com.onepoint.formmanager.dto.SubmissionDTOs.*;
import com.onepoint.formmanager.entity.User;
import com.onepoint.formmanager.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/public")
    public ResponseEntity<SubmissionResponse> submitPublicForm(@Valid @RequestBody SubmissionRequest request,
                                                               @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(submissionService.submitForm(request, user));
    }

    @PostMapping
    public ResponseEntity<SubmissionResponse> submitAuthorizedForm(@Valid @RequestBody SubmissionRequest request,
                                                                   @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(submissionService.submitForm(request, user));
    }

    @GetMapping("/resume/{token}")
    public ResponseEntity<SubmissionResponse> getDraftByToken(@PathVariable String token) {
        return ResponseEntity.ok(submissionService.getSubmissionByToken(token));
    }

    @GetMapping("/form/{formId}")
    public ResponseEntity<List<SubmissionResponse>> getFormSubmissions(@PathVariable Long formId,
                                                                       @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(submissionService.getFormSubmissions(formId, user));
    }
}
