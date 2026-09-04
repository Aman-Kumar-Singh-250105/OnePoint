package com.onepoint.formmanager.repository;

import com.onepoint.formmanager.entity.Form;
import com.onepoint.formmanager.entity.FormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long> {
    List<FormSubmission> findByFormAndIsDraftFalseOrderBySubmittedAtDesc(Form form);
    Optional<FormSubmission> findBySubmissionToken(String submissionToken);

    long countByFormAndIsDraftFalse(Form form);

    @Query("SELECT COUNT(s) FROM FormSubmission s WHERE s.form = :form AND s.isDraft = false AND s.submittedAt >= :since")
    long countSubmissionsSince(Form form, LocalDateTime since);

    List<FormSubmission> findByEmployeeIdOrderBySubmittedAtDesc(String employeeId);
}
