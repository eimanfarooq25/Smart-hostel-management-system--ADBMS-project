# Smart Hostel Management System

A comprehensive multi-city hostel booking and management system built with MySQL, designed for student accommodations across Pakistani cities.

## Project Overview

The Smart Hostel Management Platform is a database-driven system that manages hostel operations across Lahore, Karachi, and Islamabad. It supports flexible stay durations, paid amenities, meal subscriptions, automated billing, and comprehensive audit logging.

## Key Features

- Multi-city hostel network with 12+ properties
- Real-time bed-level booking with overbooking prevention
- Flexible stay durations (daily, weekly, monthly, semester)
- Paid amenities system with inventory management
- Automated invoice generation and payment tracking
- Room transfers and booking extensions
- Maintenance request tracking
- Guest registration and approval workflow
- Comprehensive audit logging

## Technical Stack

- **Database:** MySQL 8.0
- **Storage Engine:** InnoDB (ACID compliance)
- **Normalization:** 3NF
- **Tables:** 23
- **Triggers:** 7
- **Views:** 6
- **Indexes:** 25+

## Database Architecture

### User Roles

1. **Student** - Book rooms, pay invoices, manage bookings
2. **Warden** - Approve requests, manage operations
3. **Hostel Owner** - Manage properties, view revenue
4. **Super Admin** - Platform configuration and oversight

### Core Tables

- User Management: roles, users, hostel_owners
- Property Management: hostels, rooms, beds, room_categories
- Booking System: bookings, booking_amenities, booking_extensions, early_checkouts
- Financial: invoices, payments
- Operations: maintenance_requests, complaints, guest_registrations
- Amenities: amenities, hostel_amenities
- Meal Plans: meal_plans, student_meal_subscriptions
- System: notifications, audit_logs, room_transfers

## ACID Properties Implementation

### Atomicity
All booking operations are wrapped in transactions. Either all steps succeed or all rollback.

### Consistency
7 triggers enforce business rules:
- prevent_overbooking
- update_room_occupancy
- update_amenity_inventory
- auto_generate_invoice
- check_payment_deadline
- prevent_wrong_floor_allocation
- mark_high_turnover

### Isolation
Row-level locking with SELECT FOR UPDATE prevents concurrent booking conflicts. Isolation level: READ COMMITTED.

### Durability
InnoDB write-ahead logging ensures committed transactions survive system crashes.

## Installation

### Prerequisites

- MySQL 8.0 or higher
- MySQL Workbench (optional, for GUI)
