package com.onepoint.formmanager.repository;

import com.onepoint.formmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmployeeId(String employeeId);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmployeeIdOrEmail(String employeeId, String email);
    Boolean existsByEmployeeId(String employeeId);
    Boolean existsByEmail(String email);
}
