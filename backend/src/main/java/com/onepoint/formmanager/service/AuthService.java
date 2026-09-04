package com.onepoint.formmanager.service;

import com.onepoint.formmanager.dto.AuthDTOs.*;
import com.onepoint.formmanager.entity.User;
import com.onepoint.formmanager.enums.Role;
import com.onepoint.formmanager.repository.UserRepository;
import com.onepoint.formmanager.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmployeeIdOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new RuntimeException("Invalid Employee ID / Email or Password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Employee ID / Email or Password");
        }

        String token = jwtUtil.generateToken(user.getEmployeeId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .employeeId(user.getEmployeeId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .role(user.getRole())
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new RuntimeException("Employee ID already registered");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email address already registered");
        }

        User user = User.builder()
                .employeeId(request.getEmployeeId())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .department(request.getDepartment())
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmployeeId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .employeeId(user.getEmployeeId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .role(user.getRole())
                .build();
    }

    public String processForgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmployeeIdOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new RuntimeException("No account found matching provided Employee ID or Email"));

        String resetBody = "Hello " + user.getFullName() + ",\n\nWe received a password reset request for your OnePoint account. Your password reset link/instructions have been issued. If this was not requested by you, please contact IT support.";
        emailService.sendEmail(user.getEmail(), "Password Reset Instructions - OnePoint", resetBody);

        return "Password reset link has been dispatched to " + user.getEmail();
    }
}
