package com.philharmonic.controller;

import com.philharmonic.dto.AuthenticationRequest;
import com.philharmonic.dto.AuthenticationResponse;
import com.philharmonic.dto.RegisterRequest;
import com.philharmonic.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {
        try {
            return ResponseEntity.ok(service.register(request));
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Username is already taken")) {
                return ResponseEntity.status(409).body(java.util.Map.of("message", "Username already taken"));
            }
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}