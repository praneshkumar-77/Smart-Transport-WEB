package com.smarttransport.service;

import com.smarttransport.dto.LocationRequest;
import com.smarttransport.entity.Location;
import com.smarttransport.entity.Trip;
import com.smarttransport.entity.TripStatus;
import com.smarttransport.entity.Vehicle;
import com.smarttransport.exception.ResourceNotFoundException;
import com.smarttransport.repository.LocationRepository;
import com.smarttransport.repository.TripRepository;
import com.smarttransport.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;

    public Location logLocation(LocationRequest request) {
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (trip.getStatus() != TripStatus.STARTED && trip.getStatus() != TripStatus.IN_PROGRESS) {
            throw new RuntimeException("Cannot log location. Trip is not active.");
        }

        // 1. Maintain location history for the trip
        Location location = Location.builder()
                .trip(trip)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(LocalDateTime.now())
                .build();

        Location savedLocation = locationRepository.save(location);

        // 2. Update the vehicle's current overall location
        Vehicle vehicle = trip.getVehicle();
        vehicle.setCurrentLatitude(request.getLatitude());
        vehicle.setCurrentLongitude(request.getLongitude());
        vehicleRepository.save(vehicle);

        return savedLocation;
    }

    public List<Location> getTripLocations(Long tripId) {
        return locationRepository.findByTripIdOrderByTimestampDesc(tripId);
    }

    public Location getLatestLocation(Long tripId) {
        return locationRepository.findFirstByTripIdOrderByTimestampDesc(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("No location data found for this trip"));
    }
}
