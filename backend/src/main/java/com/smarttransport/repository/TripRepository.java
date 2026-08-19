package com.smarttransport.repository;

import com.smarttransport.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByDriverId(Long driverId);

    List<Trip> findByCustomerId(Long customerId);

    List<Trip> findByVehicleId(Long vehicleId);
}
