package com.billing.usagebilling.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.billing.usagebilling.dto.CreateUserRequest;
import com.billing.usagebilling.dto.LoginRequest;
import com.billing.usagebilling.dto.LoginResponse;
import com.billing.usagebilling.dto.RegisterRequest;
import com.billing.usagebilling.entity.User;
import com.billing.usagebilling.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        User user = new User(
            request.getUsername(),
            passwordEncoder.encode(request.getPassword()),
            request.getRole() != null ? request.getRole().toUpperCase() : "CUSTOMER",
            request.getSecurityQuestion(),
            request.getSecurityAnswer()
        );

        userRepository.save(user);
    }

    public String getSecurityQuestion(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getSecurityQuestion();
    }

    public LoginResponse authenticate(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Supports BCrypt encoded passwords alongside plain text passwords for existing records
        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword()) 
                || request.getPassword().equals(user.getPassword());

        if (!matches) {
            throw new RuntimeException("Invalid credentials");
        }

        return new LoginResponse("mock-jwt-token", user.getUsername(), user.getRole());
    }

    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean matches = passwordEncoder.matches(oldPassword, user.getPassword()) 
                || oldPassword.equals(user.getPassword());

        if (!matches) {
            throw new RuntimeException("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public Page<User> getUsersPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable);
    }

    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        User user = new User(
            request.getUsername(),
            passwordEncoder.encode(request.getPassword()),
            request.getRole() != null ? request.getRole() : "ADMIN",
            request.getSecurityQuestion(),
            request.getSecurityAnswer()
        );

        return userRepository.save(user);
    }

    public User updateUserRoleByUsername(String username, String newRole) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User with ID " + id + " not found");
        }
        userRepository.deleteById(id);
    }

    public void deleteUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
}