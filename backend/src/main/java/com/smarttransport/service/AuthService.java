package com.smarttransport.service;

import com.smarttransport.dto.AuthRequest;
import com.smarttransport.dto.AuthResponse;
import com.smarttransport.dto.RegisterRequest;
import com.smarttransport.entity.Customer;
import com.smarttransport.entity.Role;
import com.smarttransport.entity.User;
import com.smarttransport.repository.UserRepository;
import com.smarttransport.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final UserDetailsService userDetailsService;

        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already taken");
                }

                Role userRole = Role.CUSTOMER;
                if (request.getRole() != null) {
                        try {
                                userRole = Role.valueOf(request.getRole().toUpperCase());
                        } catch (IllegalArgumentException e) {
                                userRole = Role.CUSTOMER;
                        }
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .phone(request.getPhone())
                                .role(userRole)
                                .build();

                userRepository.save(user);

                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String jwtToken = jwtService.generateToken(userDetails);

                return AuthResponse.builder()
                                .id(user.getId())
                                .token(jwtToken)
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }

        public AuthResponse authenticate(AuthRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String jwtToken = jwtService.generateToken(userDetails);

                return AuthResponse.builder()
                                .id(user.getId())
                                .token(jwtToken)
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }
}
