INSERT INTO users (id, name, email, password, phone, role) VALUES 
(1, 'Admin', 'admin@example.com', '$2a$10$DowXG.lQ.WStm3rZ/9fU/OkqNtzs.1qM2g3m2HnJgZ9Q5zW3q0/z2', '1234567890', 'ADMIN'),
(2, 'Driver One', 'driver@example.com', '$2a$10$DowXG.lQ.WStm3rZ/9fU/OkqNtzs.1qM2g3m2HnJgZ9Q5zW3q0/z2', '1234567890', 'DRIVER');

INSERT INTO vehicles (id, registration_number, brand, model, capacity, vehicle_type, status) VALUES 
(1, 'MH-12-AB-1234', 'Tata', 'Nexon', 4, 'SUV', 'AVAILABLE'),
(2, 'KA-01-XY-9876', 'Hyundai', 'Sedan', 4, 'SEDAN', 'AVAILABLE'),
(3, 'MH-14-CD-5678', 'Mahindra', 'XUV700', 7, 'SUV', 'AVAILABLE');

INSERT INTO drivers (id, user_id, license_number, license_expiry_date, availability_status, vehicle_id) VALUES 
(1, 2, 'DL12345678', '2030-12-31', 'AVAILABLE', 1);

-- Bump the sequence for users and vehicles because of manual inserts
