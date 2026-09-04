package com.onepoint.formmanager.controller;

import com.onepoint.formmanager.dto.AnalyticsDTOs.DashboardMetrics;
import com.onepoint.formmanager.entity.User;
import com.onepoint.formmanager.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AnalyticsService analyticsService;

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetrics> getMetrics(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(analyticsService.getDashboardMetrics(user));
    }
}
