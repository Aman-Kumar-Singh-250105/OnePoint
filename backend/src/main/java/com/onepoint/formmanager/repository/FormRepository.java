package com.onepoint.formmanager.repository;

import com.onepoint.formmanager.entity.Form;
import com.onepoint.formmanager.entity.User;
import com.onepoint.formmanager.enums.FormStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    List<Form> findByCreatedByOrderByCreatedAtDesc(User user);
    List<Form> findByStatus(FormStatus status);
    Optional<Form> findByShareToken(String shareToken);

    long countByCreatedBy(User user);
    long countByCreatedByAndStatus(User user, FormStatus status);

    @Query("SELECT f FROM Form f WHERE f.status = 'PUBLISHED' AND f.expiryDate IS NOT NULL AND f.expiryDate <= :now")
    List<Form> findExpiredForms(LocalDateTime now);

    @Query("SELECT f FROM Form f WHERE f.status = 'PUBLISHED' AND f.expiryDate IS NOT NULL AND f.expiryDate BETWEEN :now AND :soonThreshold")
    List<Form> findFormsExpiringSoon(LocalDateTime now, LocalDateTime soonThreshold);
}
