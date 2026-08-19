package com.smarttransport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

// Removed exclude since we now have JPA and Postgres configured
@SpringBootApplication
public class SmartTransportApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartTransportApplication.class, args);
    }
}
