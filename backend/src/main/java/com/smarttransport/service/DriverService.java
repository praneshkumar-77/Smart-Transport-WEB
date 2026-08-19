package com.smarttransport.service;

import com.smarttransport.dto.DriverRequest;
import com.smarttransport.entity.Driver;
import com.smarttransport.entity.DriverStatus;
import com.smarttransport.entity.Role;
import com.smarttransport.entity.User;
import com.smarttransport.entity.Vehicle;
import com.smarttransport.exception.ResourceNotFoundException;
import com.smarttransport.repository.DriverRepository;
import com.smarttransport.repository.UserRepository;
import com.smarttransport.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public Driver createDriver(DriverRequest request) {
        if (driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
            throw new RuntimeException("Driver with this license number already exists");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        // Make sure user role is promoted to DRIVER
        if (user.getRole() != Role.DRIVER) {
            user.setRole(Role.DRIVER);
            userRepository.save(user);
        }

        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            if (driverRepository.findByVehicleId(request.getVehicleId()).isPresent()) {
                throw new RuntimeException("This vehicle is already assigned to another driver");
            }
            vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle not found with id: " + request.getVehicleId()));
        }

        Driver driver = Driver.builder()
                .user(user)
                .licenseNumber(request.getLicenseNumber())
                .licenseExpiryDate(request.getLicenseExpiryDate())
                .vehicle(vehicle)
                .availabilityStatus(request.getAvailabilityStatus() != null ? request.getAvailabilityStatus()
                        : DriverStatus.AVAILABLE)
                .build();

        return driverRepository.save(driver);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
    }

    public Driver updateDriver(Long id, DriverRequest request) {
        Driver driver = getDriverById(id);

        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setLicenseExpiryDate(request.getLicenseExpiryDate());

        if (request.getAvailabilityStatus() != null) {
            driver.setAvailabilityStatus(request.getAvailabilityStatus());
        }

        if (request.getVehicleId() != null
                && (driver.getVehicle() == null || !driver.getVehicle().getId().equals(request.getVehicleId()))) {
            if (driverRepository.findByVehicleId(request.getVehicleId()).isPresent()) {
                throw new RuntimeException("This vehicle is already assigned to another driver");
            }
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle not found with id: " + request.getVehicleId()));
            driver.setVehicle(vehicle);
        } else if (request.getVehicleId() == null) {
            driver.setVehicle(null);
        }

        return driverRepository.save(driver);
    }

    public void deleteDriver(Long id) {
        Driver driver = getDriverById(id);
        if (driver.getAvailabilityStatus() == DriverStatus.ON_TRIP) {
            throw new RuntimeException("Cannot delete a driver currently on a trip");
        }
        driverRepository.delete(driver);
    }
}
