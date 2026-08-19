package com.smarttransport.dto;

import com.smarttransport.entity.TripStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TripRequest {
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Driver ID is required")
    private Long driverId;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Source location is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "Expected arrival time is required")
    @Future(message = "Expected arrival time must be in the future")
    private LocalDateTime expectedArrival;

    private TripStatus status;
}
