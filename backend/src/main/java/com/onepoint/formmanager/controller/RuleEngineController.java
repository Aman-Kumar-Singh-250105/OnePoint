package com.onepoint.formmanager.controller;

import com.onepoint.formmanager.dto.RuleEngineDTOs.*;
import com.onepoint.formmanager.service.RuleEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rule-engine")
@RequiredArgsConstructor
public class RuleEngineController {

    private final RuleEngineService ruleEngineService;

    @PostMapping("/generate")
    public ResponseEntity<RuleGenerationResponse> generateForm(@Valid @RequestBody RuleGenerationRequest request) {
        return ResponseEntity.ok(ruleEngineService.generateFormFromPrompt(request.getPrompt()));
    }
}
