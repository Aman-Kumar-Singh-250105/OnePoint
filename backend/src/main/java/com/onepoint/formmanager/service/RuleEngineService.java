package com.onepoint.formmanager.service;

import com.onepoint.formmanager.dto.FormDTOs.*;
import com.onepoint.formmanager.dto.RuleEngineDTOs.*;
import com.onepoint.formmanager.enums.DistributionType;
import com.onepoint.formmanager.enums.FormStatus;
import com.onepoint.formmanager.enums.QuestionType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class RuleEngineService {

    public RuleGenerationResponse generateFormFromPrompt(String promptText) {
        String prompt = promptText != null ? promptText.trim().toLowerCase(Locale.ROOT) : "";

        String matchedCategory = "CUSTOM_GENERAL";
        String explanation;
        FormRequest formRequest;

        if (prompt.contains("onboard") || prompt.contains("new hire") || prompt.contains("joining")) {
            matchedCategory = "ONBOARDING";
            explanation = "Matched 'Onboarding' keywords. Generated employee onboarding check-in form schema.";
            formRequest = createOnboardingTemplate();
        } else if (prompt.contains("feedback") || prompt.contains("morale") || prompt.contains("pulse") || prompt.contains("employee feedback")) {
            matchedCategory = "EMPLOYEE_FEEDBACK";
            explanation = "Matched 'Feedback' keywords. Generated comprehensive workplace feedback survey.";
            formRequest = createFeedbackTemplate();
        } else if (prompt.contains("exit") || prompt.contains("resignation") || prompt.contains("offboard") || prompt.contains("leaving")) {
            matchedCategory = "EXIT_FORM";
            explanation = "Matched 'Exit Form' keywords. Generated exit interview and feedback form.";
            formRequest = createExitFormTemplate();
        } else if (prompt.contains("train") || prompt.contains("workshop") || prompt.contains("course") || prompt.contains("skill")) {
            matchedCategory = "TRAINING_ASSESSMENT";
            explanation = "Matched 'Training' keywords. Generated post-training evaluation assessment form.";
            formRequest = createTrainingTemplate();
        } else if (prompt.contains("compliance") || prompt.contains("audit") || prompt.contains("security") || prompt.contains("safety")) {
            matchedCategory = "COMPLIANCE_AUDIT";
            explanation = "Matched 'Compliance' keywords. Generated internal compliance checklist and audit form.";
            formRequest = createComplianceTemplate();
        } else if (prompt.contains("event") || prompt.contains("register") || prompt.contains("party") || prompt.contains("conference") || prompt.contains("rsvp")) {
            matchedCategory = "EVENT_REGISTRATION";
            explanation = "Matched 'Event' keywords. Generated corporate event registration and preference form.";
            formRequest = createEventTemplate();
        } else if (prompt.contains("customer") || prompt.contains("csat") || prompt.contains("client") || prompt.contains("satisfaction")) {
            matchedCategory = "CUSTOMER_SATISFACTION";
            explanation = "Matched 'Customer Satisfaction' keywords. Generated CSAT evaluation form.";
            formRequest = createCSATTemplate();
        } else if (prompt.contains("performance") || prompt.contains("review") || prompt.contains("appraisal")) {
            matchedCategory = "PERFORMANCE_REVIEW";
            explanation = "Matched 'Performance' keywords. Generated employee performance review template.";
            formRequest = createPerformanceTemplate();
        } else if (prompt.contains("it") || prompt.contains("support") || prompt.contains("ticket") || prompt.contains("equipment")) {
            matchedCategory = "IT_SUPPORT";
            explanation = "Matched 'IT Support' keywords. Generated IT equipment request and support ticket form.";
            formRequest = createITSupportTemplate();
        } else {
            explanation = "Parsed custom prompt and extracted dynamically structured form fields.";
            formRequest = createCustomDynamicTemplate(prompt);
        }

        // Custom keyword enrichments
        if (prompt.contains("anonymous")) {
            formRequest.setAllowAnonymous(true);
        }
        if (prompt.contains("public")) {
            formRequest.setDistributionType(DistributionType.PUBLIC_LINK);
        }

        return RuleGenerationResponse.builder()
                .prompt(promptText)
                .matchedCategory(matchedCategory)
                .generatedForm(formRequest)
                .explanation(explanation)
                .build();
    }

    public FormRequest createOnboardingTemplate() {
        List<FormSectionRequest> sections = new ArrayList<>();

        sections.add(FormSectionRequest.builder()
                .sectionTitle("1. Personal & Role Info")
                .sectionDescription("General information about your joining date and team")
                .orderIndex(1)
                .questions(List.of(
                        QuestionRequest.builder().questionText("Full Name").questionType(QuestionType.TEXT).required(true).orderIndex(1).build(),
                        QuestionRequest.builder().questionText("Corporate Email").questionType(QuestionType.EMAIL).required(true).orderIndex(2).build(),
                        QuestionRequest.builder().questionText("Department / Team").questionType(QuestionType.DROPDOWN).required(true).orderIndex(3)
                                .options(createOptions("Engineering", "Product", "Human Resources", "Sales", "Finance", "Operations")).build(),
                        QuestionRequest.builder().questionText("Joining Date").questionType(QuestionType.DATE).required(true).orderIndex(4).build()
                )).build());

        sections.add(FormSectionRequest.builder()
                .sectionTitle("2. Onboarding Experience")
                .sectionDescription("Rate your onboarding experience so far")
                .orderIndex(2)
                .questions(List.of(
                        QuestionRequest.builder().questionText("How smooth was the IT setup & access provision?").questionType(QuestionType.RATING).minRating(1).maxRating(5).required(true).orderIndex(1).build(),
                        QuestionRequest.builder().questionText("Did you receive clear expectations from your manager?").questionType(QuestionType.RADIO).required(true).orderIndex(2)
                                .options(createOptions("Yes, completely", "Somewhat", "No, need clarification")).build(),
                        QuestionRequest.builder().questionText("Additional comments or support needed").questionType(QuestionType.MULTILINE_TEXT).required(false).orderIndex(3).build()
                )).build());

        return FormRequest.builder()
                .title("Employee Onboarding Feedback Form")
                .description("Please share your initial joining experience to help us improve the onboarding program.")
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.INTERNAL_EMPLOYEE)
                .allowAnonymous(false)
                .sections(sections)
                .build();
    }

    public FormRequest createFeedbackTemplate() {
        List<FormSectionRequest> sections = new ArrayList<>();

        sections.add(FormSectionRequest.builder()
                .sectionTitle("Workplace Pulse & Morale")
                .sectionDescription("Help management understand workplace environment & culture")
                .orderIndex(1)
                .questions(List.of(
                        QuestionRequest.builder().questionText("Overall Job Satisfaction").questionType(QuestionType.RATING).minRating(1).maxRating(5).required(true).orderIndex(1).build(),
                        QuestionRequest.builder().questionText("Which areas are working exceptionally well?").questionType(QuestionType.CHECKBOX).required(false).orderIndex(2)
                                .options(createOptions("Team Collaboration", "Work-Life Balance", "Management Support", "Career Growth", "Compensation")).build(),
                        QuestionRequest.builder().questionText("How can we improve your day-to-day work experience?").questionType(QuestionType.MULTILINE_TEXT).required(true).orderIndex(3).build()
                )).build());

        return FormRequest.builder()
                .title("Employee Pulse & Culture Feedback")
                .description("Anonymous survey to evaluate employee workplace morale and culture.")
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.INTERNAL_EMPLOYEE)
                .allowAnonymous(true)
                .sections(sections)
                .build();
    }

    public FormRequest createExitFormTemplate() {
        List<FormSectionRequest> sections = new ArrayList<>();

        sections.add(FormSectionRequest.builder()
                .sectionTitle("Exit Survey")
                .sectionDescription("Feedback upon departure")
                .orderIndex(1)
                .questions(List.of(
                        QuestionRequest.builder().questionText("Primary Reason for Departure").questionType(QuestionType.DROPDOWN).required(true).orderIndex(1)
                                .options(createOptions("Better Compensation", "Career Advancement", "Work Environment", "Relocation", "Personal Reasons")).build(),
                        QuestionRequest.builder().questionText("Would you recommend our company to a friend?").questionType(QuestionType.RADIO).required(true).orderIndex(2)
                                .options(createOptions("Yes, definitely", "Maybe", "No")).build(),
                        QuestionRequest.builder().questionText("Constructive feedback for leadership").questionType(QuestionType.MULTILINE_TEXT).required(false).orderIndex(3).build()
                )).build());

        return FormRequest.builder()
                .title("Exit Interview Form")
                .description("Offboarding questionnaire for departing employees.")
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.INTERNAL_EMPLOYEE)
                .allowAnonymous(false)
                .sections(sections)
                .build();
    }

    public FormRequest createTrainingTemplate() {
        List<FormSectionRequest> sections = new ArrayList<>();

        sections.add(FormSectionRequest.builder()
                .sectionTitle("Training Evaluation")
                .sectionDescription("Assess effectiveness of training session")
                .orderIndex(1)
                .questions(List.of(
                        QuestionRequest.builder().questionText("Training Module Title").questionType(QuestionType.TEXT).required(true).orderIndex(1).build(),
                        QuestionRequest.builder().questionText("Rate Trainer Knowledge & Presentation").questionType(QuestionType.RATING).minRating(1).maxRating(5).required(true).orderIndex(2).build(),
                        QuestionRequest.builder().questionText("Was the course material relevant to your role?").questionType(QuestionType.RADIO).required(true).orderIndex(3)
                                .options(createOptions("Extremely Relevant", "Moderately Relevant", "Not Relevant")).build(),
                        QuestionRequest.builder().questionText("Suggestions for future workshops").questionType(QuestionType.MULTILINE_TEXT).required(false).orderIndex(4).build()
                )).build());

        return FormRequest.builder()
                .title("Training & Skill Assessment Survey")
                .description("Post-learning evaluation form for internal workshops and training modules.")
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.INTERNAL_EMPLOYEE)
                .allowAnonymous(true)
                .sections(sections)
                .build();
    }

    public FormRequest createComplianceTemplate() {
        List<FormSectionRequest> sections = new ArrayList<>();

        sections.add(FormSectionRequest.builder()
                .sectionTitle("Compliance Checklist")
                .sectionDescription("Self-audit security & policy compliance")
                .orderIndex(1)
                .questions(List.of(
                        QuestionRequest.builder().questionText("Department / Location").questionType(QuestionType.TEXT).required(true).orderIndex(1).build(),
                        QuestionRequest.builder().questionText("Have you completed annual Information Security Training?").questionType(QuestionType.RADIO).required(true).orderIndex(2)
                                .options(createOptions("Yes", "No", "In Progress")).build(),
                        QuestionRequest.builder().questionText("Are all compliance certificates attached?").questionType(QuestionType.RADIO).required(true).orderIndex(3)
                                .options(createOptions("Yes", "No", "N/A")).build(),
                        QuestionRequest.builder().questionText("Attach Evidence / Audit Document").questionType(QuestionType.FILE_UPLOAD).required(false).orderIndex(4).build()
                )).build());

        return FormRequest.builder()
                .title("Annual Compliance Audit Checklist")
                .description("Mandatory audit questionnaire for department leads and employees.")
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.INTERNAL_EMPLOYEE)
                .allowAnonymous(false)
                .sections(sections)
                .build();
    }

    public FormRequest createEventTemplate() {
        List<FormSectionRequest> sections = new ArrayList<>();

        sections.add(FormSectionRequest.builder()
                .sectionTitle("Event Registration Details")
                .sectionDescription("RSVP and attendance preferences")
                .orderIndex(1)
                .questions(List.of(
                        QuestionRequest.builder().questionText("Full Name").questionType(QuestionType.TEXT).required(true).orderIndex(1).build(),
                        QuestionRequest.builder().questionText("Email Address").questionType(QuestionType.EMAIL).required(true).orderIndex(2).build(),
                        QuestionRequest.builder().questionText("Attending In-Person or Virtual?").questionType(QuestionType.RADIO).required(true).orderIndex(3)
                                .options(createOptions("In-Person", "Virtual")).build(),
                        QuestionRequest.builder().questionText("Dietary Preferences / Restrictions").questionType(QuestionType.CHECKBOX).required(false).orderIndex(4)
                                .options(createOptions("Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher", "No Preference")).build()
                )).build());

        return FormRequest.builder()
                .title("Corporate Event Registration")
                .description("RSVP form for annual townhall & tech summit.")
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.PUBLIC_LINK)
                .allowAnonymous(false)
                .sections(sections)
                .build();
    }

    public FormRequest createCSATTemplate() {
        List<FormSectionRequest> sections = new ArrayList<>();

        sections.add(FormSectionRequest.builder()
                .sectionTitle("Customer Satisfaction Survey")
                .sectionDescription("Client feedback evaluation")
                .orderIndex(1)
                .questions(List.of(
                        QuestionRequest.builder().questionText("How satisfied are you with our service?").questionType(QuestionType.RATING).minRating(1).maxRating(5).required(true).orderIndex(1).build(),
                        QuestionRequest.builder().questionText("Likelihood to recommend us to a colleague (NPS)").questionType(QuestionType.NUMBER).required(true).orderIndex(2).build(),
                        QuestionRequest.builder().questionText("What features do you value most?").questionType(QuestionType.CHECKBOX).required(false).orderIndex(3)
                                .options(createOptions("Ease of Use", "Speed & Reliability", "Customer Support", "Pricing", "Security")).build(),
                        QuestionRequest.builder().questionText("Detailed feedback").questionType(QuestionType.MULTILINE_TEXT).required(false).orderIndex(4).build()
                )).build());

        return FormRequest.builder()
                .title("Customer Satisfaction (CSAT) Survey")
                .description("External client satisfaction assessment form.")
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.PUBLIC_LINK)
                .allowAnonymous(true)
                .sections(sections)
                .build();
    }

    public FormRequest createPerformanceTemplate() {
        List<FormSectionRequest> sections = new ArrayList<>();

        sections.add(FormSectionRequest.builder()
                .sectionTitle("Self-Appraisal & Goals")
                .sectionDescription("Evaluate accomplishments and targets")
                .orderIndex(1)
                .questions(List.of(
                        QuestionRequest.builder().questionText("Key Achievements this quarter").questionType(QuestionType.MULTILINE_TEXT).required(true).orderIndex(1).build(),
                        QuestionRequest.builder().questionText("Self-Rating on Core Deliverables").questionType(QuestionType.RATING).minRating(1).maxRating(5).required(true).orderIndex(2).build(),
                        QuestionRequest.builder().questionText("Key Goals for next quarter").questionType(QuestionType.MULTILINE_TEXT).required(true).orderIndex(3).build()
                )).build());

        return FormRequest.builder()
                .title("Employee Performance Review")
                .description("Quarterly performance self-appraisal form.")
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.INTERNAL_EMPLOYEE)
                .allowAnonymous(false)
                .sections(sections)
                .build();
    }

    public FormRequest createITSupportTemplate() {
        List<FormSectionRequest> sections = new ArrayList<>();

        sections.add(FormSectionRequest.builder()
                .sectionTitle("IT Service Request")
                .sectionDescription("Submit technical issue or hardware request")
                .orderIndex(1)
                .questions(List.of(
                        QuestionRequest.builder().questionText("Issue / Request Type").questionType(QuestionType.DROPDOWN).required(true).orderIndex(1)
                                .options(createOptions("Hardware Request", "Software License", "Network / VPN Issue", "Password Reset", "Other")).build(),
                        QuestionRequest.builder().questionText("Priority Level").questionType(QuestionType.RADIO).required(true).orderIndex(2)
                                .options(createOptions("Low", "Medium", "High", "Critical / Blocker")).build(),
                        QuestionRequest.builder().questionText("Issue Description & Steps to Reproduce").questionType(QuestionType.MULTILINE_TEXT).required(true).orderIndex(3).build()
                )).build());

        return FormRequest.builder()
                .title("IT Support & Equipment Request")
                .description("Form for requesting IT hardware, software licenses, or support assistance.")
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.INTERNAL_EMPLOYEE)
                .allowAnonymous(false)
                .sections(sections)
                .build();
    }

    private FormRequest createCustomDynamicTemplate(String prompt) {
        List<FormSectionRequest> sections = new ArrayList<>();
        List<QuestionRequest> questions = new ArrayList<>();

        questions.add(QuestionRequest.builder().questionText("Respondent Name").questionType(QuestionType.TEXT).required(true).orderIndex(1).build());
        questions.add(QuestionRequest.builder().questionText("Email Address").questionType(QuestionType.EMAIL).required(true).orderIndex(2).build());

        if (prompt.contains("date") || prompt.contains("when") || prompt.contains("time")) {
            questions.add(QuestionRequest.builder().questionText("Preferred Date & Time").questionType(QuestionType.DATE).required(true).orderIndex(questions.size() + 1).build());
        }

        if (prompt.contains("rating") || prompt.contains("score") || prompt.contains("rate")) {
            questions.add(QuestionRequest.builder().questionText("Overall Rating").questionType(QuestionType.RATING).minRating(1).maxRating(5).required(true).orderIndex(questions.size() + 1).build());
        }

        questions.add(QuestionRequest.builder().questionText("Detailed Feedback / Response").questionType(QuestionType.MULTILINE_TEXT).required(false).orderIndex(questions.size() + 1).build());

        sections.add(FormSectionRequest.builder()
                .sectionTitle("General Form Section")
                .sectionDescription("Dynamically generated questions based on your prompt")
                .orderIndex(1)
                .questions(questions)
                .build());

        String generatedTitle = prompt.length() > 30 ? prompt.substring(0, 30) + "..." : prompt;
        if (generatedTitle.isBlank()) generatedTitle = "Custom Form";

        return FormRequest.builder()
                .title("Generated Form: " + generatedTitle)
                .description("Automatically rule-generated form schema for: " + prompt)
                .status(FormStatus.DRAFT)
                .distributionType(DistributionType.PUBLIC_LINK)
                .allowAnonymous(false)
                .sections(sections)
                .build();
    }

    private List<QuestionOptionRequest> createOptions(String... labels) {
        List<QuestionOptionRequest> list = new ArrayList<>();
        for (int i = 0; i < labels.length; i++) {
            list.add(QuestionOptionRequest.builder()
                    .optionLabel(labels[i])
                    .optionValue(labels[i].toUpperCase(Locale.ROOT).replaceAll("\\s+", "_"))
                    .orderIndex(i + 1)
                    .build());
        }
        return list;
    }
}
