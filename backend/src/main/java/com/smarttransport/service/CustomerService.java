package com.smarttransport.service;

import com.smarttransport.dto.CustomerRequest;
import com.smarttransport.entity.Customer;
import com.smarttransport.entity.User;
import com.smarttransport.exception.ResourceNotFoundException;
import com.smarttransport.repository.CustomerRepository;
import com.smarttransport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public Customer createCustomerProfile(CustomerRequest request) {
        if (customerRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new RuntimeException("Customer profile already exists for this user");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Customer customer = Customer.builder()
                .user(user)
                .address(request.getAddress())
                .build();

        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    public Customer getCustomerByUserId(Long userId) {
        return customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user: " + userId));
    }

    public Customer updateCustomer(Long id, CustomerRequest request) {
        Customer customer = getCustomerById(id);
        customer.setAddress(request.getAddress());
        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }
}
