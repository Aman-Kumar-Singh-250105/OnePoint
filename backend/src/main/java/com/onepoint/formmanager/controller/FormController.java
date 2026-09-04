package com.onepoint.formmanager.controller;

import com.onepoint.formmanager.dto.FormDTOs.*;
import com.onepoint.formmanager.entity.User;
import com.onepoint.formmanager.enums.FormStatus;
import com.onepoint.formmanager.service.FormService;
import com.onepoint.formmanager.service.QrCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;
    private final QrCodeService qrCodeService;

    @PostMapping
    public ResponseEntity<FormResponse> createForm(@Valid @RequestBody FormRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(formService.createForm(request, user));
    }

    @GetMapping
    public ResponseEntity<List<FormResponse>> getUserForms(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(formService.getUserForms(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormResponse> getFormById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(formService.getFormById(id, user));
    }

    @GetMapping("/share/{token}")
    public ResponseEntity<FormResponse> getFormByShareToken(@PathVariable String token) {
        return ResponseEntity.ok(formService.getFormByShareToken(token));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormResponse> updateForm(@PathVariable Long id, @Valid @RequestBody FormRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(formService.updateForm(id, request, user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FormResponse> updateStatus(@PathVariable Long id, @RequestParam FormStatus status, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(formService.updateStatus(id, status, user));
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<FormResponse> cloneForm(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(formService.cloneForm(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable Long id, @AuthenticationPrincipal User user) {
        formService.deleteForm(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/qr-code")
    public ResponseEntity<String> getQrCode(@PathVariable Long id, @RequestParam(defaultValue = "300") int width, @RequestParam(defaultValue = "300") int height, @AuthenticationPrincipal User user) {
        FormResponse form = formService.getFormById(id, user);
        String publicUrl = "http://localhost:4200/forms/public/" + form.getShareToken();
        String base64Qr = qrCodeService.generateQrCodeBase64(publicUrl, width, height);
        return ResponseEntity.ok(base64Qr);
    }
}
