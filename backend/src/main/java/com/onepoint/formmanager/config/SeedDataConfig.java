package com.onepoint.formmanager.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.onepoint.formmanager.dto.FormDTOs.FormRequest;
import com.onepoint.formmanager.entity.*;
import com.onepoint.formmanager.enums.*;
import com.onepoint.formmanager.repository.*;
import com.onepoint.formmanager.service.FormService;
import com.onepoint.formmanager.service.RuleEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class SeedDataConfig {

    private final UserRepository userRepository;
    private final FormTemplateRepository templateRepository;
    private final FormService formService;
    private final RuleEngineService ruleEngineService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            log.info("Initializing Seed Data...");

            // Seed Demo Users
            if (!userRepository.existsByEmployeeId("EMP001")) {
                User admin = User.builder()
                        .employeeId("EMP001")
                        .email("admin@onepoint.com")
                        .password(passwordEncoder.encode("Password@123"))
                        .fullName("Alex Morgan (Admin)")
                        .department("Executive / IT")
                        .role(Role.ROLE_ADMIN)
                        .build();
                userRepository.save(admin);
            }

            if (!userRepository.existsByEmployeeId("EMP002")) {
                User hrLead = User.builder()
                        .employeeId("EMP002")
                        .email("hr@onepoint.com")
                        .password(passwordEncoder.encode("Password@123"))
                        .fullName("Sarah Jenkins (HR Lead)")
                        .department("Human Resources")
                        .role(Role.ROLE_MANAGER)
                        .build();
                userRepository.save(hrLead);
            }

            if (!userRepository.existsByEmployeeId("EMP003")) {
                User emp = User.builder()
                        .employeeId("EMP003")
                        .email("employee@onepoint.com")
                        .password(passwordEncoder.encode("Password@123"))
                        .fullName("David Chen (Software Engineer)")
                        .department("Engineering")
                        .role(Role.ROLE_EMPLOYEE)
                        .build();
                userRepository.save(emp);
            }

            User defaultAdmin = userRepository.findByEmployeeId("EMP001").orElseThrow();

            // Seed Templates if empty
            if (templateRepository.count() == 0) {
                seedTemplate("HR", "Employee Feedback Form", "Pulse survey evaluating workplace culture & satisfaction.", ruleEngineService.createFeedbackTemplate(), "user-check");
                seedTemplate("HR", "Employee Onboarding Survey", "Check-in form for new hires during their first 30 days.", ruleEngineService.createOnboardingTemplate(), "user-plus");
                seedTemplate("HR", "Exit Interview Questionnaire", "Offboarding evaluation form for departing staff.", ruleEngineService.createExitFormTemplate(), "log-out");
                seedTemplate("L&D", "Training & Skill Assessment", "Post-training evaluation for technical & soft-skills workshops.", ruleEngineService.createTrainingTemplate(), "book-open");
                seedTemplate("Compliance", "Compliance Audit Checklist", "Self-audit security policy & regulatory compliance checklist.", ruleEngineService.createComplianceTemplate(), "shield-check");
                seedTemplate("Events", "Corporate Event Registration", "RSVP form for summits, townhalls, and company dinners.", ruleEngineService.createEventTemplate(), "calendar");
                seedTemplate("Customer Success", "Customer Satisfaction (CSAT) Survey", "Client satisfaction & Net Promoter Score evaluation.", ruleEngineService.createCSATTemplate(), "smile");

                log.info("Successfully seeded 7 Corporate Form Templates.");
            }

            // Create initial published sample form if admin has 0 forms
            if (formService.getUserForms(defaultAdmin).isEmpty()) {
                FormRequest sampleFormReq = ruleEngineService.createFeedbackTemplate();
                sampleFormReq.setStatus(FormStatus.PUBLISHED);
                formService.createForm(sampleFormReq, defaultAdmin);

                FormRequest sampleOnboardReq = ruleEngineService.createOnboardingTemplate();
                sampleOnboardReq.setStatus(FormStatus.PUBLISHED);
                formService.createForm(sampleOnboardReq, defaultAdmin);

                log.info("Created 2 initial published demo forms for Admin.");
            }

            log.info("OnePoint Seed Data Initialization Complete.");
        };
    }

    private void seedTemplate(String category, String title, String description, FormRequest req, String icon) {
        try {
            String json = objectMapper.writeValueAsString(req);
            FormTemplate template = FormTemplate.builder()
                    .category(category)
                    .title(title)
                    .description(description)
                    .templateJson(json)
                    .iconName(icon)
                    .build();
            templateRepository.save(template);
        } catch (Exception e) {
            log.error("Failed to seed template {}", title, e);
        }
    }
}
