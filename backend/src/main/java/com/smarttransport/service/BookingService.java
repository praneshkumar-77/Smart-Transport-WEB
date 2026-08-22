package com.smarttransport.service;

import com.smarttransport.dto.BookingRequest;
import com.smarttransport.entity.*;
import com.smarttransport.exception.ResourceNotFoundException;
import com.smarttransport.repository.BookingRepository;
import com.smarttransport.repository.CustomerRepository;
import com.smarttransport.repository.TripRepository;
import com.smarttransport.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;
    private final com.smarttransport.repository.DriverRepository driverRepository;

    @Transactional
    public Booking createBooking(BookingRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        // 1. Double Booking Prevention logic
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.PENDING);
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                request.getVehicleId(),
                activeStatuses,
                request.getStartTime(),
                request.getExpectedArrival());

        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Vehicle is already booked for this specific time slot");
        }

        // 2. Create the associated Trip (no driver assigned yet)
        Trip temporaryTrip = Trip.builder()
                .vehicle(vehicle)
                .customer(customer)
                .source(request.getSource())
                .destination(request.getDestination())
                .startTime(request.getStartTime())
                .expectedArrival(request.getExpectedArrival())
                .status(TripStatus.SCHEDULED)
                .build();

        tripRepository.save(temporaryTrip);

        // 3. Create the booking entry
        Booking booking = Booking.builder()
                .customer(customer)
                .vehicle(vehicle)
                .trip(temporaryTrip)
                .bookingDate(LocalDateTime.now())
                .status(BookingStatus.PENDING)
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    public Booking confirmBooking(Long id, Long driverId) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot confirm a cancelled booking");
        }

        if (driverId != null && booking.getTrip() != null) {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

            if (driver.getAvailabilityStatus() != DriverStatus.AVAILABLE) {
                throw new RuntimeException("Driver is not available");
            }

            Trip trip = booking.getTrip();
            trip.setDriver(driver);
            tripRepository.save(trip);
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.CANCELLED);

        // Cancel the trip automatically if booking is cancelled
        if (booking.getTrip() != null) {
            Trip trip = booking.getTrip();
            trip.setStatus(TripStatus.CANCELLED);
            tripRepository.save(trip);
        }

        return bookingRepository.save(booking);
    }
}
