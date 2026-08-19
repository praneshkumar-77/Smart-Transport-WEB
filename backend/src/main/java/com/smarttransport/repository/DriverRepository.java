package com.smarttransport.repository;

import com.smarttransport.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByUserId(Long userId);

    Optional<Driver> findByLicenseNumber(String licenseNumber);

    Optional<Driver> findByVehicleId(Long vehicleId);
}
