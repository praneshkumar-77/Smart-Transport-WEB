package com.smarttransport.controller;

import com.smarttransport.dto.LocationRequest;
import com.smarttransport.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    // Driver posts their location
    @PostMapping("/locations")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Map<String, Object>> logLocation(@Valid @RequestBody LocationRequest request) {
        return buildResponse(locationService.logLocation(request), "Location updated successfully");
    }

    // Customer or Admin can get the whole trail
    @GetMapping("/trips/{tripId}/locations")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'DRIVER')")
    public ResponseEntity<Map<String, Object>> getTripLocations(@PathVariable Long tripId) {
        return buildResponse(locationService.getTripLocations(tripId), "Location history retrieved");
    }

    // Customer gets pinpoint
    @GetMapping("/trips/{tripId}/location/latest")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'DRIVER')")
    public ResponseEntity<Map<String, Object>> getLatestLocation(@PathVariable Long tripId) {
        return buildResponse(locationService.getLatestLocation(tripId), "Latest location retrieved");
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
