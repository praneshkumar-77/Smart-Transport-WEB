package com.smarttransport.controller;

import com.smarttransport.dto.TripRequest;
import com.smarttransport.entity.TripStatus;
import com.smarttransport.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<Map<String, Object>> getAllTrips() {
        return buildResponse(tripService.getAllTrips(), "Trips retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getTripById(@PathVariable Long id) {
        return buildResponse(tripService.getTripById(id), "Trip retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createTrip(@Valid @RequestBody TripRequest request) {
        return buildResponse(tripService.createTrip(request), "Trip scheduled successfully");
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<Map<String, Object>> updateTripStatus(
            @PathVariable Long id,
            @RequestParam TripStatus status) {
        return buildResponse(tripService.updateTripStatus(id, status), "Trip status updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return buildResponse(null, "Trip deleted successfully");
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
