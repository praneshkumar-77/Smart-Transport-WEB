package com.smarttransport.controller;

import com.smarttransport.dto.BookingRequest;
import com.smarttransport.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getAllBookings() {
        return buildResponse(bookingService.getAllBookings(), "Bookings retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getBookingById(@PathVariable Long id) {
        return buildResponse(bookingService.getBookingById(id), "Booking retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> createBooking(@Valid @RequestBody BookingRequest request) {
        return buildResponse(bookingService.createBooking(request), "Booking created successfully");
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> confirmBooking(@PathVariable Long id) {
        return buildResponse(bookingService.confirmBooking(id), "Booking confirmed successfully");
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Long id) {
        return buildResponse(bookingService.cancelBooking(id), "Booking cancelled successfully");
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
