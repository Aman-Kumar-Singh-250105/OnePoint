package com.onepoint.formmanager.service;

import com.onepoint.formmanager.dto.FormDTOs.*;
import com.onepoint.formmanager.entity.*;
import com.onepoint.formmanager.enums.DistributionType;
import com.onepoint.formmanager.enums.FormStatus;
import com.onepoint.formmanager.repository.FormRepository;
import com.onepoint.formmanager.repository.FormTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormService {

    private final FormRepository formRepository;
    private final FormTemplateRepository templateRepository;

    @Transactional
    public FormResponse createForm(FormRequest request, User currentUser) {
        Form form = new Form();
        form.setTitle(request.getTitle());
        form.setDescription(request.getDescription());
        form.setStatus(request.getStatus() != null ? request.getStatus() : FormStatus.DRAFT);
        form.setDistributionType(request.getDistributionType() != null ? request.getDistributionType() : DistributionType.PUBLIC_LINK);
        form.setAllowAnonymous(request.getAllowAnonymous() != null ? request.getAllowAnonymous() : false);
        form.setResponseLimit(request.getResponseLimit());
        form.setStartDate(request.getStartDate());
        form.setExpiryDate(request.getExpiryDate());
        form.setShareToken(UUID.randomUUID().toString().replaceAll("-", "").substring(0, 16));
        form.setCreatedBy(currentUser);

        buildFormSections(form, request.getSections());

        Form saved = formRepository.save(form);
        return mapToFormResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FormResponse> getUserForms(User currentUser) {
        return formRepository.findByCreatedByOrderByCreatedAtDesc(currentUser).stream()
                .map(this::mapToFormResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FormResponse getFormById(Long formId, User currentUser) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found with id: " + formId));
        return mapToFormResponse(form);
    }

    @Transactional(readOnly = true)
    public FormResponse getFormByShareToken(String shareToken) {
        Form form = formRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Form link is invalid or expired"));

        // Auto-check expiry
        if (form.getExpiryDate() != null && form.getExpiryDate().isBefore(LocalDateTime.now())) {
            form.setStatus(FormStatus.EXPIRED);
            formRepository.save(form);
        }

        return mapToFormResponse(form);
    }

    @Transactional
    public FormResponse updateForm(Long formId, FormRequest request, User currentUser) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        if (!form.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized to modify this form");
        }

        form.setTitle(request.getTitle());
        form.setDescription(request.getDescription());
        if (request.getStatus() != null) form.setStatus(request.getStatus());
        if (request.getDistributionType() != null) form.setDistributionType(request.getDistributionType());
        if (request.getAllowAnonymous() != null) form.setAllowAnonymous(request.getAllowAnonymous());
        form.setResponseLimit(request.getResponseLimit());
        form.setStartDate(request.getStartDate());
        form.setExpiryDate(request.getExpiryDate());

        form.getSections().clear();
        buildFormSections(form, request.getSections());

        Form updated = formRepository.save(form);
        return mapToFormResponse(updated);
    }

    @Transactional
    public FormResponse updateStatus(Long formId, FormStatus status, User currentUser) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        form.setStatus(status);
        return mapToFormResponse(formRepository.save(form));
    }

    @Transactional
    public FormResponse cloneForm(Long formId, User currentUser) {
        Form original = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Original form not found"));

        Form clone = new Form();
        clone.setTitle("Copy of " + original.getTitle());
        clone.setDescription(original.getDescription());
        clone.setStatus(FormStatus.DRAFT);
        clone.setDistributionType(original.getDistributionType());
        clone.setAllowAnonymous(original.getAllowAnonymous());
        clone.setResponseLimit(original.getResponseLimit());
        clone.setShareToken(UUID.randomUUID().toString().replaceAll("-", "").substring(0, 16));
        clone.setCreatedBy(currentUser);

        List<FormSectionRequest> sectionRequests = original.getSections().stream().map(s -> {
            FormSectionRequest sr = new FormSectionRequest();
            sr.setSectionTitle(s.getSectionTitle());
            sr.setSectionDescription(s.getSectionDescription());
            sr.setOrderIndex(s.getOrderIndex());

            List<QuestionRequest> qrList = s.getQuestions().stream().map(q -> {
                QuestionRequest qr = new QuestionRequest();
                qr.setQuestionText(q.getQuestionText());
                qr.setHelpText(q.getHelpText());
                qr.setQuestionType(q.getQuestionType());
                qr.setRequired(q.getRequired());
                qr.setOrderIndex(q.getOrderIndex());
                qr.setMinRating(q.getMinRating());
                qr.setMaxRating(q.getMaxRating());
                qr.setValidationRegex(q.getValidationRegex());

                List<QuestionOptionRequest> optList = q.getOptions().stream().map(o -> {
                    QuestionOptionRequest opt = new QuestionOptionRequest();
                    opt.setOptionLabel(o.getOptionLabel());
                    opt.setOptionValue(o.getOptionValue());
                    opt.setOrderIndex(o.getOrderIndex());
                    return opt;
                }).collect(Collectors.toList());

                qr.setOptions(optList);
                return qr;
            }).collect(Collectors.toList());

            sr.setQuestions(qrList);
            return sr;
        }).collect(Collectors.toList());

        buildFormSections(clone, sectionRequests);

        return mapToFormResponse(formRepository.save(clone));
    }

    @Transactional
    public void deleteForm(Long formId, User currentUser) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        formRepository.delete(form);
    }

    private void buildFormSections(Form form, List<FormSectionRequest> sectionRequests) {
        if (sectionRequests == null) return;

        for (int i = 0; i < sectionRequests.size(); i++) {
            FormSectionRequest sr = sectionRequests.get(i);
            FormSection section = new FormSection();
            section.setForm(form);
            section.setSectionTitle(sr.getSectionTitle());
            section.setSectionDescription(sr.getSectionDescription());
            section.setOrderIndex(sr.getOrderIndex() != null ? sr.getOrderIndex() : i + 1);

            if (sr.getQuestions() != null) {
                for (int j = 0; j < sr.getQuestions().size(); j++) {
                    QuestionRequest qr = sr.getQuestions().get(j);
                    Question question = new Question();
                    question.setSection(section);
                    question.setQuestionText(qr.getQuestionText());
                    question.setHelpText(qr.getHelpText());
                    question.setQuestionType(qr.getQuestionType());
                    question.setRequired(qr.getRequired() != null ? qr.getRequired() : false);
                    question.setOrderIndex(qr.getOrderIndex() != null ? qr.getOrderIndex() : j + 1);
                    question.setMinRating(qr.getMinRating());
                    question.setMaxRating(qr.getMaxRating());
                    question.setValidationRegex(qr.getValidationRegex());

                    if (qr.getOptions() != null) {
                        for (int k = 0; k < qr.getOptions().size(); k++) {
                            QuestionOptionRequest optReq = qr.getOptions().get(k);
                            QuestionOption option = new QuestionOption();
                            option.setQuestion(question);
                            option.setOptionLabel(optReq.getOptionLabel());
                            option.setOptionValue(optReq.getOptionValue());
                            option.setOrderIndex(optReq.getOrderIndex() != null ? optReq.getOrderIndex() : k + 1);
                            question.getOptions().add(option);
                        }
                    }

                    section.getQuestions().add(question);
                }
            }

            form.getSections().add(section);
        }
    }

    public FormResponse mapToFormResponse(Form form) {
        List<FormSectionResponse> sectionResponses = form.getSections().stream().map(s -> {
            List<QuestionResponse> questionResponses = s.getQuestions().stream().map(q -> {
                List<QuestionOptionResponse> optionResponses = q.getOptions().stream().map(o ->
                        QuestionOptionResponse.builder()
                                .id(o.getId())
                                .optionLabel(o.getOptionLabel())
                                .optionValue(o.getOptionValue())
                                .orderIndex(o.getOrderIndex())
                                .build()
                ).collect(Collectors.toList());

                return QuestionResponse.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .helpText(q.getHelpText())
                        .questionType(q.getQuestionType())
                        .required(q.getRequired())
                        .orderIndex(q.getOrderIndex())
                        .minRating(q.getMinRating())
                        .maxRating(q.getMaxRating())
                        .validationRegex(q.getValidationRegex())
                        .options(optionResponses)
                        .build();
            }).collect(Collectors.toList());

            return FormSectionResponse.builder()
                    .id(s.getId())
                    .sectionTitle(s.getSectionTitle())
                    .sectionDescription(s.getSectionDescription())
                    .orderIndex(s.getOrderIndex())
                    .questions(questionResponses)
                    .build();
        }).collect(Collectors.toList());

        return FormResponse.builder()
                .id(form.getId())
                .title(form.getTitle())
                .description(form.getDescription())
                .status(form.getStatus())
                .distributionType(form.getDistributionType())
                .allowAnonymous(form.getAllowAnonymous())
                .responseLimit(form.getResponseLimit())
                .currentResponseCount(form.getCurrentResponseCount())
                .startDate(form.getStartDate())
                .expiryDate(form.getExpiryDate())
                .shareToken(form.getShareToken())
                .createdByEmployeeId(form.getCreatedBy() != null ? form.getCreatedBy().getEmployeeId() : "SYSTEM")
                .createdByName(form.getCreatedBy() != null ? form.getCreatedBy().getFullName() : "System")
                .createdAt(form.getCreatedAt())
                .updatedAt(form.getUpdatedAt())
                .sections(sectionResponses)
                .build();
    }
}
