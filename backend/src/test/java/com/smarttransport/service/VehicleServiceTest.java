package com.smarttransport.service;

import com.smarttransport.dto.VehicleRequest;
import com.smarttransport.entity.Vehicle;
import com.smarttransport.entity.VehicleStatus;
import com.smarttransport.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private VehicleRequest vehicleRequest;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        vehicleRequest = VehicleRequest.builder()
                .registrationNumber("MH-12-AB-1234")
                .vehicleType("SUV")
                .model("Innova")
                .brand("Toyota")
                .capacity(6)
                .build();

        vehicle = Vehicle.builder()
                .id(1L)
                .registrationNumber("MH-12-AB-1234")
                .vehicleType("SUV")
                .model("Innova")
                .brand("Toyota")
                .capacity(6)
                .status(VehicleStatus.AVAILABLE)
                .build();
    }

    @Test
    void createVehicle_ShouldSaveAndReturnVehicle() {
        when(vehicleRepository.findByRegistrationNumber(vehicleRequest.getRegistrationNumber()))
                .thenReturn(Optional.empty());
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        Vehicle savedVehicle = vehicleService.createVehicle(vehicleRequest);

        assertNotNull(savedVehicle);
        assertEquals("MH-12-AB-1234", savedVehicle.getRegistrationNumber());
        assertEquals(VehicleStatus.AVAILABLE, savedVehicle.getStatus());
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void createVehicle_ShouldThrowExceptionIfRegistrationExists() {
        when(vehicleRepository.findByRegistrationNumber(vehicleRequest.getRegistrationNumber()))
                .thenReturn(Optional.of(vehicle));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            vehicleService.createVehicle(vehicleRequest);
        });

        assertEquals("Vehicle with registration number already exists", exception.getMessage());
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }
}
