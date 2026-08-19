package com.smarttransport.service;

import com.smarttransport.dto.TripRequest;
import com.smarttransport.entity.*;
import com.smarttransport.exception.ResourceNotFoundException;
import com.smarttransport.repository.CustomerRepository;
import com.smarttransport.repository.DriverRepository;
import com.smarttransport.repository.TripRepository;
import com.smarttransport.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;

    public Trip createTrip(TripRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("Vehicle is not available for a new trip");
        }

        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        if (driver.getAvailabilityStatus() != DriverStatus.AVAILABLE) {
            throw new RuntimeException("Driver is not available for a new trip");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Trip trip = Trip.builder()
                .vehicle(vehicle)
                .driver(driver)
                .customer(customer)
                .source(request.getSource())
                .destination(request.getDestination())
                .startTime(request.getStartTime())
                .expectedArrival(request.getExpectedArrival())
                .status(TripStatus.SCHEDULED)
                .build();

        return tripRepository.save(trip);
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
    }

    public Trip updateTripStatus(Long id, TripStatus newStatus) {
        Trip trip = getTripById(id);
        TripStatus currentStatus = trip.getStatus();

        // Validate state transitions
        if (currentStatus == TripStatus.COMPLETED || currentStatus == TripStatus.CANCELLED) {
            throw new RuntimeException("Cannot update status of a Completed or Cancelled trip");
        }

        trip.setStatus(newStatus);

        // Update Driver and Vehicle statuses based on the trip's lifecycle
        if (newStatus == TripStatus.STARTED || newStatus == TripStatus.IN_PROGRESS) {
            trip.getVehicle().setStatus(VehicleStatus.IN_TRIP);
            trip.getDriver().setAvailabilityStatus(DriverStatus.ON_TRIP);
        } else if (newStatus == TripStatus.COMPLETED || newStatus == TripStatus.CANCELLED) {
            trip.getVehicle().setStatus(VehicleStatus.AVAILABLE);
            trip.getDriver().setAvailabilityStatus(DriverStatus.AVAILABLE);
            if (newStatus == TripStatus.COMPLETED) {
                trip.setActualArrival(LocalDateTime.now());
            }
        }

        vehicleRepository.save(trip.getVehicle());
        driverRepository.save(trip.getDriver());

        return tripRepository.save(trip);
    }

    public void deleteTrip(Long id) {
        Trip trip = getTripById(id);
        if (trip.getStatus() == TripStatus.STARTED || trip.getStatus() == TripStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot delete an active trip");
        }
        tripRepository.delete(trip);
    }
}
