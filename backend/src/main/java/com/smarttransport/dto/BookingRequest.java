package com.smarttransport.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotBlank(message = "Source location is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Trip start time is required")
    @Future(message = "Trip start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "Trip expected arrival is required")
    @Future(message = "Trip expected arrival time must be in the future")
    private LocalDateTime expectedArrival;
}
