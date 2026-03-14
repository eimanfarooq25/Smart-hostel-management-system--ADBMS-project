# Smart Hostel Management System

A comprehensive multi-city hostel booking and management system with MySQL database and REST API backend, designed for student accommodations across Pakistani cities.

## Project Overview

The Smart Hostel Management Platform is a full-stack database-driven system that manages hostel operations across Lahore, Karachi, and Islamabad. It supports flexible stay durations, paid amenities, meal subscriptions, automated billing, and comprehensive audit logging.

## Key Features

### Database Features
- Multi-city hostel network with 12+ properties
- Real-time bed-level booking with overbooking prevention
- Flexible stay durations (daily, weekly, monthly, semester)
- Paid amenities system with inventory management
- Automated invoice generation and payment tracking
- Room transfers and booking extensions
- Maintenance request tracking
- Guest registration and approval workflow
- Comprehensive audit logging

### Backend API Features
- RESTful API with JWT authentication
- Role-based access control (RBAC)
- ACID transaction management
- Bcrypt password hashing
- Automated rollback on errors
- Interactive Swagger documentation
- Connection pooling for performance

## Technical Stack

### Database (Phase 1)
- **Database:** MySQL 8.0
- **Storage Engine:** InnoDB (ACID compliance)
- **Normalization:** 3NF
- **Tables:** 23
- **Triggers:** 7
- **Views:** 6
- **Indexes:** 25+

### Backend (Phase 2)
- **Runtime:** Node.js v20+
- **Framework:** Express.js
- **Authentication:** JWT + bcrypt
- **API Documentation:** Swagger/OpenAPI 3.0
- **Database Driver:** mysql2 (promise-based)

## Database Architecture

### User Roles
1. **Student** - Book rooms, pay invoices, manage bookings
2. **Warden** - Approve requests, manage operations
3. **Hostel Owner** - Manage properties, view revenue
4. **Super Admin** - Platform configuration and oversight

### Core Tables
- **User Management:** roles, users, hostel_owners
- **Property Management:** hostels, rooms, beds, room_categories
- **Booking System:** bookings, booking_amenities, booking_extensions, early_checkouts
- **Financial:** invoices, payments
- **Operations:** maintenance_requests, complaints, guest_registrations
- **Amenities:** amenities, hostel_amenities
- **Meal Plans:** meal_plans, student_meal_subscriptions
- **System:** notifications, audit_logs, room_transfers

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
- Node.js v20 or higher
- npm
- MySQL Workbench (optional, for GUI)

### Database Setup (Phase 1)

1. **Create database**
```bash
mysql -u root -p
CREATE DATABASE hostel_db;
USE hostel_db;
EXIT;
```

2. **Run schema**
```bash
mysql -u root -p hostel_db < database/schema.sql
```

3. **Load seed data**
```bash
mysql -u root -p hostel_db < database/seed.sql
```

4. **Test performance (optional)**
```bash
mysql -u root -p hostel_db < database/performance.sql
```

### Backend Setup (Phase 2)

1. **Navigate to backend folder**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

Example `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hostel_db

JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development
```

4. **Start server**
```bash
npm run dev
```

Server runs on http://localhost:3000

5. **Access API Documentation**
```
http://localhost:3000/api-docs
```

## Project Structure
```
hostel-project/
├── database/              # Phase 1: Database implementation
│   ├── schema.sql         # Complete database schema
│   ├── seed.sql           # Sample data for testing
│   └── performance.sql    # Index optimization queries
├── docs/                  # Phase 1: Documentation
│   ├── ACID_Documentation.pdf
│   └── Schema_Documentation.pdf
└── backend/               # Phase 2: REST API
    ├── src/
    │   ├── config/        # Database connection
    │   ├── controllers/   # Business logic
    │   ├── middleware/    # Auth, RBAC, validation
    │   └── routes/        # API endpoints
    ├── media/             # Screenshots
    ├── swagger.yaml       # API documentation
    └── server.js          # Entry point
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/profile` - Get user profile (protected)

### Bookings (ACID Transactions)
- `POST /api/v1/bookings` - Create booking (student only)
- `GET /api/v1/bookings` - Get user bookings (protected)
- `GET /api/v1/bookings/:id` - Get specific booking (protected)
- `DELETE /api/v1/bookings/:id` - Cancel booking (student only)

### Hostels & Rooms
- `GET /api/v1/hostels` - Get all hostels
- `GET /api/v1/hostels/:id` - Get hostel details
- `GET /api/v1/hostels/:id/rooms` - Get rooms in hostel

### Amenities
- `GET /api/v1/amenities` - Get all amenities
- `POST /api/v1/amenities` - Create amenity (owner/admin only)

### Meal Plans
- `GET /api/v1/meals` - Get all meal plans
- `POST /api/v1/meals/subscribe` - Subscribe (student only)

### Complaints
- `POST /api/v1/complaints` - Submit complaint (student only)
- `GET /api/v1/complaints` - Get complaints (role-based access)

### Maintenance
- `POST /api/v1/maintenance` - Create request
- `GET /api/v1/maintenance` - Get requests
- `PUT /api/v1/maintenance/:id/status` - Update status (warden only)

### Guest Registration
- `POST /api/v1/guests` - Register guest (student only)
- `GET /api/v1/guests` - Get registrations
- `PUT /api/v1/guests/:id/status` - Approve/reject (warden only)

## Authentication Flow

### Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "city": "Lahore"
}
```

### Login
```bash
POST /api/v1/auth/login

{
  "email": "student@example.com",
  "password": "password123"
}
```

Response includes JWT token valid for 24 hours.

### Protected Routes
```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

## Security Features

- **Password Security:** Bcrypt hashing (10 rounds)
- **SQL Injection Prevention:** Parameterized queries only
- **JWT Security:** 24-hour token expiration
- **RBAC Enforcement:** Middleware checks on all protected routes
- **Input Validation:** Server-side validation with express-validator

## Database Statistics

- **Tables:** 23 normalized tables (3NF)
- **Triggers:** 7 for business logic enforcement
- **Views:** 6 for optimized queries
- **Indexes:** 25+ strategic indexes
- **Seed Records:** 329+ sample records
- **User Roles:** 4 (student, warden, hostel_owner, super_admin)

## Performance Optimization

### Query Performance Improvements
- Room availability search: 145ms → 12ms (92% faster)
- Booking history retrieval: 200ms → 18ms (91% faster)
- Pending payments lookup: 180ms → 15ms (91.7% faster)

### Backend Optimization
- Connection pooling (10 concurrent connections)
- Strategic indexing on frequently queried columns
- View-based queries for complex joins
- Transaction management with automatic rollback

## Testing

### Database Testing
Run performance queries:
```bash
mysql -u root -p hostel_db < database/performance.sql
```

### API Testing
1. Access Swagger UI: http://localhost:3000/api-docs
2. Use Thunder Client in VS Code
3. Test transaction rollback (try booking same bed twice)

### Test Credentials
Create test user via `/auth/register` or use seeded users from Phase 1.

## Contributors

- [Your Name] - Database design, backend development, full-stack implementation
- Ezzah - Schema documentation, ER diagram design

## Course Information

- **Course:** Advanced Database Management
- **Institution:** Information Technology University (ITU)
- **Semester:** Spring 2026
- **Phases:** Phase 1 (Database) + Phase 2 (Backend API)

## Documentation

- Database Schema Documentation: `docs/Schema_Documentation.pdf`
- ACID Transaction Analysis: `docs/ACID_Documentation.pdf`
- API Documentation: http://localhost:3000/api-docs (when server is running)
- Backend README: `backend/README.md`

## License

Educational project for academic purposes.

## Support

For issues:
1. Check API documentation at `/api-docs`
2. Review console error messages
3. Verify database connection
4. Ensure JWT token is valid and not expired

---

**Phase 1 (Database):** Complete ✅  
**Phase 2 (Backend API):** Complete ✅  
**Ready for Production:** ✅
