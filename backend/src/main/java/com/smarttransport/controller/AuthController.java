package com.smarttransport.controller;

import com.smarttransport.dto.AuthRequest;
import com.smarttransport.dto.AuthResponse;
import com.smarttransport.dto.RegisterRequest;
import com.smarttransport.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return buildResponse(authResponse, "User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticate(@Valid @RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.authenticate(request);
        return buildResponse(authResponse, "Login successful");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(AuthResponse data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
}
