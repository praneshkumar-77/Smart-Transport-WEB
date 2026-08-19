package com.smarttransport.dto;

import com.smarttransport.entity.DriverStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DriverRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotNull(message = "License expiry date is required")
    @Future(message = "License expiry date must be in the future")
    private LocalDate licenseExpiryDate;

    private Long vehicleId; // Assigned vehicle
    private DriverStatus availabilityStatus;
}
