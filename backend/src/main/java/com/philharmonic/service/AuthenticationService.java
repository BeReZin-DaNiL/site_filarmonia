package com.philharmonic.service;

import com.philharmonic.dto.AuthenticationRequest;
import com.philharmonic.dto.AuthenticationResponse;
import com.philharmonic.dto.RegisterRequest;
import com.philharmonic.entity.Role;
import com.philharmonic.entity.User;
import com.philharmonic.repository.UserRepository;
import com.philharmonic.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }

        var user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(Role.USER); // Default role
        repository.save(user);
        
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                 .username(user.getUsername())
                 .password(user.getPassword())
                 .roles(user.getRole().name())
                 .build();
        
        var jwtToken = jwtUtil.generateToken(userDetails);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();
                
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                 .username(user.getUsername())
                 .password(user.getPassword())
                 .roles(user.getRole().name())
                 .build();
                 
        var jwtToken = jwtUtil.generateToken(userDetails);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }
}