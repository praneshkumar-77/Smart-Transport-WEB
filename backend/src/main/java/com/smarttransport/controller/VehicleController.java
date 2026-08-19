package com.smarttransport.controller;

import com.smarttransport.dto.VehicleRequest;
import com.smarttransport.entity.Vehicle;
import com.smarttransport.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllVehicles() {
        return buildResponse(vehicleService.getAllVehicles(), "Vehicles retrieved successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getVehicleById(@PathVariable Long id) {
        return buildResponse(vehicleService.getVehicleById(id), "Vehicle retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createVehicle(@Valid @RequestBody VehicleRequest request) {
        return buildResponse(vehicleService.createVehicle(request), "Vehicle created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateVehicle(@PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        return buildResponse(vehicleService.updateVehicle(id, request), "Vehicle updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return buildResponse(null, "Vehicle deleted successfully");
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
