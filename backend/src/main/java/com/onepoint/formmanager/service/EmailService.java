package com.onepoint.formmanager.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendEmail(String to, String subject, String bodyHtml) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("noreply@onepoint.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(bodyHtml, true);

            mailSender.send(message);
            log.info("Email successfully sent to {}", to);
        } catch (Exception e) {
            log.warn("Could not send email to {} via SMTP server. Logged body fallback: {}\nError: {}", to, subject, e.getMessage());
        }
    }

    public void sendSubmissionConfirmation(String recipientEmail, String formTitle, String submissionToken) {
        String subject = "Submission Confirmation: " + formTitle;
        String html = "<div style='font-family: Arial, sans-serif; padding: 20px; color: #1e293b;'>"
                + "<h2 style='color: #2563eb;'>OnePoint Form Submission Received</h2>"
                + "<p>Thank you for completing the form <strong>" + formTitle + "</strong>.</p>"
                + "<p>Your submission reference ID is: <code style='background: #f1f5f9; padding: 4px 8px; border-radius: 4px;'>" + submissionToken + "</code></p>"
                + "<br><p>Best regards,<br>OnePoint Platform Team</p>"
                + "</div>";
        sendEmail(recipientEmail, subject, html);
    }

    public void sendCreatorResponseAlert(String creatorEmail, String formTitle, String respondentName) {
        String subject = "New Response Received: " + formTitle;
        String html = "<div style='font-family: Arial, sans-serif; padding: 20px; color: #1e293b;'>"
                + "<h2 style='color: #059669;'>New Form Submission Alert</h2>"
                + "<p>Your form <strong>" + formTitle + "</strong> received a new response from <strong>" + respondentName + "</strong>.</p>"
                + "<p>Log in to your OnePoint dashboard to view analytics and detailed responses.</p>"
                + "</div>";
        sendEmail(creatorEmail, subject, html);
    }

    public void sendLimitReachedAlert(String creatorEmail, String formTitle, int limit) {
        String subject = "Response Limit Reached: " + formTitle;
        String html = "<div style='font-family: Arial, sans-serif; padding: 20px; color: #1e293b;'>"
                + "<h2 style='color: #dc2626;'>Form Response Limit Reached</h2>"
                + "<p>Your form <strong>" + formTitle + "</strong> has reached its maximum limit of <strong>" + limit + "</strong> submissions.</p>"
                + "<p>The form status has been updated to prevent further submissions.</p>"
                + "</div>";
        sendEmail(creatorEmail, subject, html);
    }

    public void sendExpiringSoonAlert(String creatorEmail, String formTitle, String expiryDateStr) {
        String subject = "Form Expiring Soon: " + formTitle;
        String html = "<div style='font-family: Arial, sans-serif; padding: 20px; color: #1e293b;'>"
                + "<h2 style='color: #d97706;'>Form Expiry Notice</h2>"
                + "<p>Your form <strong>" + formTitle + "</strong> is scheduled to expire on <strong>" + expiryDateStr + "</strong>.</p>"
                + "</div>";
        sendEmail(creatorEmail, subject, html);
    }
}
