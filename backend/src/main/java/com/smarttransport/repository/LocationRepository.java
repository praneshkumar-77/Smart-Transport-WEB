package com.smarttransport.repository;

import com.smarttransport.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByTripIdOrderByTimestampDesc(Long tripId);

    Optional<Location> findFirstByTripIdOrderByTimestampDesc(Long tripId);
}
