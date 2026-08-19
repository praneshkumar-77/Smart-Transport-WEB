package com.smarttransport.controller;

import com.smarttransport.dto.CustomerRequest;
import com.smarttransport.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllCustomers() {
        return buildResponse(customerService.getAllCustomers(), "Customers retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getCustomerById(@PathVariable Long id) {
        return buildResponse(customerService.getCustomerById(id), "Customer retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        // Technically this could be tied into the auto Auth registration flow,
        // but we expose it for completing a profile later.
        return buildResponse(customerService.createCustomerProfile(request), "Customer profile created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> updateCustomer(@PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        return buildResponse(customerService.updateCustomer(id, request), "Customer profile updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return buildResponse(null, "Customer deleted successfully");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(Object data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        if (data != null)
            response.put("data", data);
        return ResponseEntity.ok(response);
    }
}
