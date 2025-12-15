package com.philharmonic.controller;

import com.philharmonic.entity.User;
import com.philharmonic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody User userDetails) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDetails.getFullName() != null) user.setFullName(userDetails.getFullName());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
        // Password update should be handled separately or here with encoding
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
             user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }
}