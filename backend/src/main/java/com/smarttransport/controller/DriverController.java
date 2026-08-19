package com.smarttransport.controller;

import com.smarttransport.dto.DriverRequest;
import com.smarttransport.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<Map<String, Object>> getAllDrivers() {
        return buildResponse(driverService.getAllDrivers(), "Drivers retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<Map<String, Object>> getDriverById(@PathVariable Long id) {
        return buildResponse(driverService.getDriverById(id), "Driver retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createDriver(@Valid @RequestBody DriverRequest request) {
        return buildResponse(driverService.createDriver(request), "Driver created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateDriver(@PathVariable Long id,
            @Valid @RequestBody DriverRequest request) {
        return buildResponse(driverService.updateDriver(id, request), "Driver updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return buildResponse(null, "Driver deleted successfully");
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
