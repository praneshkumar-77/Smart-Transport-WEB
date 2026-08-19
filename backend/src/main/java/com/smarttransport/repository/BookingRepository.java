package com.smarttransport.repository;

import com.smarttransport.entity.Booking;
import com.smarttransport.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);

    // Check for double booking (overlapping active bookings for the same vehicle)
    @Query("SELECT b FROM Booking b WHERE b.vehicle.id = :vehicleId " +
            "AND b.status IN (:statuses) " +
            "AND b.trip.startTime < :expectedEnd " +
            "AND b.trip.expectedArrival > :newStart")
    List<Booking> findOverlappingBookings(
            @Param("vehicleId") Long vehicleId,
            @Param("statuses") List<BookingStatus> statuses,
            @Param("newStart") LocalDateTime newStart,
            @Param("expectedEnd") LocalDateTime expectedEnd);
}
