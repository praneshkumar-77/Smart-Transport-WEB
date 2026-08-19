package com.smarttransport.service;

import com.smarttransport.dto.VehicleRequest;
import com.smarttransport.entity.Vehicle;
import com.smarttransport.entity.VehicleStatus;
import com.smarttransport.exception.ResourceNotFoundException;
import com.smarttransport.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public Vehicle createVehicle(VehicleRequest request) {
        if (vehicleRepository.findByRegistrationNumber(request.getRegistrationNumber()).isPresent()) {
            throw new RuntimeException("Vehicle with registration number already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .vehicleType(request.getVehicleType())
                .model(request.getModel())
                .brand(request.getBrand())
                .capacity(request.getCapacity())
                .status(request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE)
                .build();

        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    public Vehicle updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = getVehicleById(id);

        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setModel(request.getModel());
        vehicle.setBrand(request.getBrand());
        vehicle.setCapacity(request.getCapacity());

        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }

        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleById(id);
        if (vehicle.getStatus() == VehicleStatus.IN_TRIP) {
            throw new RuntimeException("Cannot delete a vehicle currently on a trip");
        }
        vehicleRepository.delete(vehicle);
    }
}
