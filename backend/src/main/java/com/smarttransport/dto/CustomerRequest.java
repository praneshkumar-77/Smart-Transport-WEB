package com.smarttransport.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Address is required")
    private String address;
}
