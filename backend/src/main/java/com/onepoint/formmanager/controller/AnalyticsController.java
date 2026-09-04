package com.onepoint.formmanager.controller;

import com.onepoint.formmanager.dto.AnalyticsDTOs.FormAnalytics;
import com.onepoint.formmanager.entity.User;
import com.onepoint.formmanager.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/form/{formId}")
    public ResponseEntity<FormAnalytics> getFormAnalytics(@PathVariable Long formId,
                                                          @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getFormAnalytics(formId, user));
    }
}
