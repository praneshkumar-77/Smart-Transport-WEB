# Smart Transport Management System

![Project Banner](https://via.placeholder.com/1000x300.png?text=Smart+Transport+Management+System)

> **A professional, full-stack enterprise web application designed for comprehensive transportation management.**

## 📖 Project Overview
The Smart Transport Management System is an end-to-end platform for organizations to manage vehicle fleets, assign drivers, orchestrate live trips, and process customer reservations. Built on a modular monolithic architecture, the system guarantees high security via token-based authentication and features a live WebSocket GPS tracking module.

## 🚀 Key Features
* **Role-Based Access Control (RBAC):** Admin, Driver, and Customer security domains protected by JWT.
* **Double Booking Prevention:** Real-time database algorithms prevent scheduling conflicts.
* **Live Location Tracking:** STOMP over WebSockets streaming live GPS coordinates.
* **Rich Dashboards:** Glassmorphism UI built in React with live chart metric data.

## 💻 Technology Stack
* **Backend:** Java 17, Spring Boot 3, Spring Security, JWT, WebSockets
* **Database:** PostgreSQL mapped via Spring Data JPA / Hibernate
* **Frontend:** React, Vite, React Router DOM, Axios
* **DevOps:** Docker, Docker Compose
* **Docs:** Swagger UI / OpenAPI 2

## 🏗 System Architecture Diagram
```text
                 SMART TRANSPORT MANAGEMENT SYSTEM

                         ┌───────────────┐
                         │     USER      │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ React UI      │
                         └───────┬───────┘
                                 │ REST API & WebSockets
                                 ▼
                         ┌───────────────┐
                         │ Spring Boot   │
                         └───────┬───────┘
                                 │
                         ┌───────┴───────┐
                         │  PostgreSQL   │
                         └───────────────┘
```

## 🗄 Entity-Relationship (ER) Design
* **Users & Roles:** Master table handling BCrypt hashing.
* **Customers & Drivers:** Profile relationships mapped (`@OneToOne`) against physical instances.
* **Vehicles:** Dynamic `.AVAILABLE / .IN_TRIP` state machine tracking.
* **Trips & Bookings:** Core orchestration mapping vehicle, driver, and consumer into physical time-bound domains.
* **Locations:** High-volume time-series matrix mapping coordinates.

## ⚙️ Installation & Deployment

### 1. Database Setup
Launch PostgreSQL and manually create a database instance:
```sql
CREATE DATABASE smart_transport_db;
```

### 2. Standard Native Boot (Development)
**Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 3. Full DevOps Deployment (Production)
Deploy the full multi-tier infrastructure simultaneously using Docker Compose:
```bash
docker-compose up --build -d
```

## 🧪 Testing Protocol
* **Backend:** Automated unit testing written with JUnit 5 and Mockito. (Run via `mvn test`)
* **API Documentation:** Interactive documentation is injected at `http://localhost:8080/swagger-ui.html`

## 🔮 Future Enhancements
* Interactive MapBox integration for visual routing.
* Machine learning algorithms for ETA and surge pricing.
* Stripe integration for processing Booking Payments.

---
**Created securely by an AI programming duo for advanced Spring Boot/React Portfolio Architecture.**
