# 🏠 HostelBuddy — Smart Hostel Management System

> A full-stack, multi-city hostel booking and management platform built for student accommodations across Pakistani cities.  
> Covers room bookings, complaints, maintenance, meal plans, guest registrations, analytics, and automated billing — all under strict role-based access control.

---

## 👥 Team

| Name | Roll Number |
|------|-------------|
| Eiman Farooq | BSCS24138 |
| Ezzah Noor | BSCS24028 |

**Course:** Advanced Database Management Systems (ADBMS)  
**Institution:** Information Technology University (ITU)  
**Semester:** Spring 2026  
**Phases:** Phase 1 (Database) ✅ · Phase 2 (Backend API) ✅ · Phase 3 (Frontend) ✅

---

## 1. Project Overview

**Domain:** Student Hostel Management — Pakistan (Lahore, Karachi, Islamabad)

**Problem It Solves:**  
Managing student hostels manually is error-prone, slow, and opaque. HostelBuddy digitises the entire hostel lifecycle on a single platform:

- **Students** browse hostels, book beds with flexible stay durations, subscribe to meal plans, register guests, file complaints, and request maintenance.
- **Wardens** manage complaint resolution, maintenance tracking, and guest approvals in real time.
- **Hostel Owners** manage amenities and monitor their properties.
- **Super Admins** have full system-wide visibility and control.

The system enforces strict **Role-Based Access Control (RBAC)** — every user sees only what their role permits, enforced on both the frontend and backend. The booking flow uses a fully **ACID-compliant MySQL transaction** with row-level locking to guarantee no double-bookings or partial state ever persist in the database.

### Key Features

**Database (Phase 1):**
- Multi-city hostel network with 12+ properties across 3 cities
- Real-time bed-level booking with overbooking prevention via triggers
- Flexible stay durations (daily, weekly, monthly, semester)
- Automated invoice generation on booking confirmation
- Floor-based allocation rules (short-term: floors 1–2, long-term: floors 3+)
- Guest registration and approval workflow
- Comprehensive audit logging

**Backend API (Phase 2):**
- RESTful API with JWT authentication
- Role-based access control (RBAC) middleware
- ACID transaction management with automatic rollback
- Bcrypt password hashing (10 salt rounds)
- Interactive Swagger documentation
- Connection pooling (10 concurrent connections)

**Frontend (Phase 3):**
- Role-aware dashboards with 4 completely distinct views
- 4-step booking wizard with live ACID transaction feedback
- Advanced hostel search and filtering (city, gender, rating)
- Analytics dashboard with live bar and pie charts
- Full CRUD interfaces for all major entities
- Toast notifications, loading states, and graceful error handling

---

## 2. Tech Stack

### Frontend (Phase 3)
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool and dev server |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptor |
| Recharts | Analytics charts (bar, pie) |
| react-hot-toast | Toast notifications |
| lucide-react | Icon library |
| CSS Variables | Design system — no external UI library |
| Google Fonts (Syne + Plus Jakarta Sans) | Typography |

### Backend (Phase 2)
| Technology | Purpose |
|------------|---------|
| Node.js v20+ | Runtime |
| Express.js | REST API framework |
| mysql2 | MySQL driver with promise-based connection pooling |
| jsonwebtoken | Stateless JWT authentication |
| bcryptjs | Password hashing (salt rounds: 10) |
| express-validator | Input validation middleware |
| swagger-ui-express | API documentation UI at `/api-docs` |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

### Database (Phase 1)
| Technology | Purpose |
|------------|---------|
| MySQL 8.0 | Relational database engine |
| InnoDB | ACID transactions and foreign key enforcement |
| Triggers (7) | Business rule automation |
| Views (6) | Pre-built analytical queries |
| Indexes (25+) | Query performance optimisation |

### Authentication
- JWT tokens with 24-hour expiration stored in browser `localStorage`
- Automatically attached to every request via Axios interceptor
- bcryptjs one-way hashing — plain-text passwords are never stored or logged

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   BROWSER  (Port 5173)                       │
│                                                              │
│   React SPA ── React Router ── Axios ── AuthContext         │
│              ↕  JWT in Authorization header                  │
└──────────────────────┬──────────────────────────────────────┘
                        │  HTTP REST  (Vite proxy → localhost:3000)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXPRESS SERVER  (Port 3000)                   │
│                                                              │
│  cors → express.json → authenticateToken → checkRole        │
│                     → express-validator  → Controller        │
│                                                              │
│  /api/v1/auth   /bookings   /hostels   /amenities           │
│  /meals         /complaints  /maintenance  /guests           │
└──────────────────────┬──────────────────────────────────────┘
                        │  mysql2 connection pool (10 connections)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 MYSQL DATABASE  (Port 3306)                   │
│                                                              │
│  23 Tables · 7 Triggers · 6 Views · 25+ Indexes             │
│  InnoDB · ACID Transactions · FK Constraints                 │
└─────────────────────────────────────────────────────────────┘
```

**Request Flow — Booking Creation:**
1. Student submits form → React sends `POST /api/v1/bookings` with JWT
2. `authenticateToken` decodes JWT → attaches `user_id` and `role`
3. `checkRole('student')` rejects wardens/admins with `403`
4. `express-validator` validates all fields
5. Controller → `BEGIN TRANSACTION` → `SELECT FOR UPDATE` locks bed row
6. Floor rule check → pricing → `INSERT INTO bookings` → amenities
7. `UPDATE status = 'confirmed'` → triggers auto-generate invoice
8. `COMMIT` or `ROLLBACK` on any error → `connection.release()`

---

## 4. UI Examples

### Login Page (`/login`)

![Login Page](screenshots/login.png)

The entry point for all roles. A split-panel layout with a dark navy branding panel on the left and a login form on the right. Features email/password validation, show/hide password toggle, and demo credential quick-fill buttons. On successful login the JWT token is stored in `localStorage` and attached to all future requests via the Axios interceptor. Any unauthenticated access to a protected route redirects here automatically. This page is required because it is the gateway for the entire RBAC system — without proper authentication no role-specific features are accessible.

---

### Booking Confirmed — ACID Transaction Success (`/book/:roomId`)

![Booking Confirmed](screenshots/booking-success.png)

Step 4 of the 4-step booking wizard showing a successful ACID transaction commit. Displays a green confirmation with Booking ID #4 and a full price breakdown: Base Price PKR 19,066 + Amenities PKR 433 = Total PKR 19,500. This screen only appears after the backend has successfully committed the entire transaction atomically — bed locked, booking inserted, amenities reserved, and invoice auto-generated by database trigger. This page is required because it visibly proves that the ACID transaction committed successfully with real pricing data from the database.

---

### Booking Failed — ACID Rollback (`/book/:roomId`)

![Booking Failed](screenshots/booking-failed.png)

Step 4 showing a failed transaction with automatic rollback. The red banner explicitly states **"Transaction rolled back — no changes were made to the database."** This demonstrates the Atomicity property — when any business rule is violated (floor allocation rules, bed unavailability, amenity out of stock), the entire transaction is rolled back and the database remains in its original state. This page is required because it makes the rollback behaviour of ACID transactions visually observable to an evaluator, directly addressing requirement 5 of the project spec.

---

### Student Dashboard (`/dashboard`)

![Student Dashboard](screenshots/dashboard.png)

The role-aware dashboard for students showing 4 live stat cards (1 Total Booking, 1 Active, 1 Open Complaint, 2 Maintenance), a Recent Bookings panel with Booking #4 confirmed, a Recent Complaints panel showing real complaints filed, and Quick Action buttons. All data is fetched live from the API. The sidebar shows student-specific navigation only — wardens and admins see completely different menus. This page is required because it demonstrates the RBAC requirement: each role gets a completely distinct view with only the data and actions relevant to them.

---

### Analytics Dashboard (`/analytics`)

![Analytics Dashboard](screenshots/analytics.png)

Live data visualisation dashboard built with Recharts, shown here for the Owner role. Displays 4 stat cards (12 Total Hostels, 0 Complaints, 2 Maintenance, 0 Resolved), a Maintenance by Priority bar chart with teal bars, a Maintenance Status Overview pie chart, and a Hostels by City bar chart showing equal distribution across Islamabad, Lahore, and Karachi (4 each). Content adapts per role — owners see hostel/maintenance data, students see their booking breakdowns. This page is required because it fulfils Complex Feature #1 (analytics dashboard with charts/visualisations).

---

## 5. Setup & Installation

### Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | 18 or higher |
| npm | 8 or higher |
| MySQL | 8.0 |
| MySQL Workbench | Any recent version |

---

### Step 1 — Database Setup

Open MySQL Workbench and run:
```sql
CREATE DATABASE hostel_db;
USE hostel_db;
```

Then open and run each file via **File → Open SQL Script → Ctrl+Shift+Enter**:
```
1. schema.sql       → 23 tables, 7 triggers, 6 views, base indexes
2. seed.sql         → 329+ sample records
3. performance.sql  → additional indexes + benchmarks
```

---

### Step 2 — Fix Seed Password Hashes ⚠️

The `seed.sql` contains placeholder bcrypt hashes that are only 26 characters — a valid bcrypt hash must be 60 characters. These cannot be verified by bcryptjs and will always fail login.

**Generate a real hash** in your backend terminal:
```bash
node -e "const b = require('bcryptjs'); b.hash('password123', 10).then(h => console.log(h))"
```

Copy the output hash, then run in MySQL Workbench:
```sql
USE hostel_db;
SET SQL_SAFE_UPDATES = 0;
UPDATE users SET password_hash = 'PASTE_YOUR_HASH_HERE';
SET SQL_SAFE_UPDATES = 1;
```

Should say **35 row(s) affected**. All seeded users now log in with `password123`.

> New users who register through the app are never affected — the backend hashes their password automatically. This fix is only for pre-seeded users.

---

### Step 3 — Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hostel_db
JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=development
```

**Variable reference:**

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_HOST` | MySQL server address | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `mypassword` |
| `DB_NAME` | Database name | `hostel_db` |
| `JWT_SECRET` | Signs/verifies JWT tokens — keep private | `hostelbuddy_secret_2024` |
| `JWT_EXPIRES_IN` | Token validity | `24h` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |

```bash
node server.js
# Server running on port 3000
# API Documentation: http://localhost:3000/api-docs
```

---

### Step 4 — Frontend Setup

```bash
cd hostelbuddy
npm install
npm run dev
# Open http://localhost:5173
```

> Vite proxies all `/api` requests to `localhost:3000` — no CORS issues.

---

### Step 5 — Assign Roles for Testing

```sql
USE hostel_db;
UPDATE users SET role_id = 2 WHERE email = 'warden.lhr1@hostels.pk';
UPDATE users SET role_id = 3 WHERE email = 'owner.excellence@hostels.pk';
UPDATE users SET role_id = 4 WHERE email = 'admin@hostels.pk';
```

---

### Running Everything

```bash
# Terminal 1: MySQL running (XAMPP or system service)

# Terminal 2
cd backend && node server.js       # port 3000

# Terminal 3
cd hostelbuddy && npm run dev      # port 5173
```

---

## 6. User Roles

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **student** | Browse hostels, book beds, cancel bookings (24h window), meal plans, complaints, maintenance, guest registration, analytics | Approve anything, manage amenities, see other users' data |
| **warden** | Update complaints, update maintenance, approve/reject guests, analytics | Book rooms, manage amenities, delete records |
| **hostel_owner** | Create/update amenities, view hostels, analytics | Student data, guest/complaint approvals |
| **super_admin** | Everything above + delete amenities, full system visibility | No restrictions |

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | `ahmed.khan@gmail.com` | `password123` |
| Warden | `warden.lhr1@hostels.pk` | `password123` |
| Hostel Owner | `owner.excellence@hostels.pk` | `password123` |
| Super Admin | `admin@hostels.pk` | `password123` |

---

## 7. Feature Walkthrough

| Feature | Description | Role | Route | API Endpoint |
|---------|-------------|------|-------|-------------|
| Register | Create student account | Public | `/register` | `POST /auth/register` |
| Login | Email/password → JWT | Public | `/login` | `POST /auth/login` |
| Role Dashboard | Stats + quick actions per role | All | `/dashboard` | `GET /auth/profile` |
| Browse Hostels | Search + filter city/gender/rating | All | `/hostels` | `GET /hostels` |
| Hostel Detail | Rooms by floor, pricing | All | `/hostels/:id` | `GET /hostels/:id/rooms` |
| Book a Room | 4-step ACID wizard | Student | `/book/:roomId` | `POST /bookings` |
| My Bookings | View + cancel bookings | Student | `/bookings` | `GET/DELETE /bookings` |
| Meal Plans | Browse + subscribe | Student | `/meals` | `GET/POST /meals/subscribe` |
| Complaints | File (student), update status (warden/admin) | Student+Warden+Admin | `/complaints` | `GET/POST /complaints` |
| Maintenance | Submit + update status | Student+Warden+Admin | `/maintenance` | `GET/POST /maintenance` |
| Guest Registration | Register (student), approve (warden/admin) | Student+Warden+Admin | `/guests` | `GET/POST /guests` |
| Amenities CRUD | Create/edit (owner), delete (admin) | Owner+Admin | `/amenities` | `GET/POST/PUT/DELETE /amenities` |
| Analytics | Live bar + pie charts | All | `/analytics` | Aggregates multiple endpoints |

---

## 8. Transaction Scenarios

### Transaction 1 — Room Booking

**Trigger:** Student clicks "Confirm Booking" on Step 3 of booking wizard at `/book/:roomId`

**Endpoint:** `POST /api/v1/bookings`  
**File:** `src/controllers/bookingController.js` → `createBooking()`

**Atomic operations:**
1. `BEGIN TRANSACTION`
2. `SELECT * FROM beds WHERE bed_id = ? FOR UPDATE` — exclusive row lock
3. Floor allocation validation (≤30 days → floors 1–2; >90 days → floors 3+)
4. Pricing calculation (daily/weekly/monthly/semester)
5. `INSERT INTO bookings` (status: pending)
6. Per amenity: inventory check + `INSERT INTO booking_amenities`
7. `UPDATE bookings SET status = 'confirmed'` → fires `auto_generate_invoice`
8. `COMMIT`

**Rollback causes:**

| Cause | Source |
|-------|--------|
| Bed not available | `SELECT FOR UPDATE` check in controller |
| Floor rule violated | `prevent_wrong_floor_allocation` trigger |
| Amenity out of stock | `update_amenity_inventory` trigger |
| Double booking attempt | `prevent_overbooking` trigger |
| Any SQL error | `catch` → `connection.rollback()` |

---

## 9. ACID Compliance

| Property | Implementation | Location |
|----------|---------------|----------|
| **Atomicity** | All operations in `BEGIN`/`COMMIT` block. `catch` calls `rollback()`. `finally` always calls `release()`. | `bookingController.js` |
| **Consistency** | 7 triggers enforce rules: `prevent_overbooking`, `prevent_wrong_floor_allocation`, `update_amenity_inventory`, `auto_generate_invoice`, `check_payment_deadline`. CHECK constraints on dates, capacity, amounts. | `schema.sql` |
| **Isolation** | `SELECT ... FOR UPDATE` locks bed row exclusively. No concurrent transaction can touch that bed until commit/rollback. | `bookingController.js` |
| **Durability** | InnoDB write-ahead logging. Committed transactions survive crashes. All tables use `ENGINE=InnoDB`. | `schema.sql` |

---

## 10. Indexing & Performance

**Database stats:** 23 tables · 7 triggers · 6 views · 25+ indexes · 329+ seed records

| Index | Table | Column(s) | Reason |
|-------|-------|-----------|--------|
| `idx_email` | users | email | Fast login lookup |
| `idx_city` | hostels | city | Most common search filter |
| `idx_status` | beds | status | Finding available beds |
| `idx_user` | bookings | user_id | Student booking history |
| `idx_dates` | bookings | start_date, end_date | Date range queries |
| `idx_hostels_city` | hostels | city | City availability query |
| `idx_bookings_user` | bookings | user_id | Per-user history |
| `idx_invoices_status` | invoices | status | Overdue invoice queries |
| `idx_bookings_status_date` | bookings | status, start_date | Analytics query |
| `idx_maintenance_status` | maintenance_requests | status, priority | Warden dashboard |

**Query performance improvements (verified via EXPLAIN ANALYZE):**

| Query | Before | After | Improvement |
|-------|--------|-------|-------------|
| Room availability by city | 145ms | 12ms | **92% faster** |
| Booking history for user | 200ms | 18ms | **91% faster** |
| Overdue invoices lookup | 180ms | 15ms | **91.7% faster** |
| Amenity revenue analytics | ~160ms | ~14ms | **~91% faster** |

---

## 11. API Reference

Full docs: **http://localhost:3000/api-docs**

| Method | Route | Auth | Role | Purpose |
|--------|-------|------|------|---------|
| `POST` | `/api/v1/auth/register` | No | Public | Register student |
| `POST` | `/api/v1/auth/login` | No | Public | Login → JWT |
| `GET` | `/api/v1/auth/profile` | Yes | All | Get profile |
| `GET` | `/api/v1/hostels` | No | Public | List hostels |
| `GET` | `/api/v1/hostels/:id` | No | Public | Hostel detail |
| `GET` | `/api/v1/hostels/:id/rooms` | No | Public | Rooms in hostel |
| `GET` | `/api/v1/hostels/rooms/:id/beds` | Yes | All | Available beds |
| `POST` | `/api/v1/bookings` | Yes | Student | Create booking (ACID) |
| `GET` | `/api/v1/bookings` | Yes | Student | Own bookings |
| `DELETE` | `/api/v1/bookings/:id` | Yes | Student | Cancel booking |
| `GET` | `/api/v1/amenities` | No | Public | List amenities |
| `POST` | `/api/v1/amenities` | Yes | Owner, Admin | Create amenity |
| `PUT` | `/api/v1/amenities/:id` | Yes | Owner, Admin | Update amenity |
| `DELETE` | `/api/v1/amenities/:id` | Yes | Admin | Delete amenity |
| `GET` | `/api/v1/meals` | No | Public | List meal plans |
| `POST` | `/api/v1/meals/subscribe` | Yes | Student | Subscribe |
| `GET` | `/api/v1/meals/subscriptions` | Yes | Student | Own subscriptions |
| `POST` | `/api/v1/complaints` | Yes | Student | Submit complaint |
| `GET` | `/api/v1/complaints` | Yes | Student, Warden, Admin | List complaints |
| `PUT` | `/api/v1/complaints/:id/status` | Yes | Warden, Admin | Update status |
| `POST` | `/api/v1/maintenance` | Yes | Student, Warden | Submit request |
| `GET` | `/api/v1/maintenance` | Yes | All | List requests |
| `PUT` | `/api/v1/maintenance/:id/status` | Yes | Warden, Admin | Update status |
| `POST` | `/api/v1/guests` | Yes | Student | Register guest |
| `GET` | `/api/v1/guests` | Yes | Student, Warden, Admin | List guests |
| `PUT` | `/api/v1/guests/:id/status` | Yes | Warden, Admin | Approve/reject |

---

## 12. Known Issues & Limitations

| Issue | Details | Status |
|-------|---------|--------|
| **Seed password hashes were placeholders** | `seed.sql` used 26-character truncated hashes that bcryptjs cannot verify. Fixed by generating a real hash with `node -e "require('bcryptjs').hash(...)"` and running `UPDATE users SET password_hash = '...'`. All 35 seeded users now work with `password123`. | ✅ Fixed |
| **update_room_occupancy trigger column error** | Original trigger referenced a non-existent `capacity` column causing all bookings to rollback. Fixed by dropping and recreating the trigger with the correct column reference. | ✅ Fixed |
| **No token refresh** | JWT tokens expire after 24h with no silent refresh — user gets redirected to login. | Minor UX issue |
| **Analytics uses client-side aggregation** | Charts aggregate raw API lists in the browser rather than a dedicated analytics endpoint. | No impact at demo scale |
| **No payment UI** | Invoices are auto-generated by triggers but no payment interface exists in the frontend. | Outside Phase 3 scope |
| **Hostel owner cannot create hostels via UI** | No `POST /hostels` endpoint — hostels are seeded only. | By design for this phase |

---

## Scripts Reference

### Backend
```bash
npm install && node server.js
```

### Frontend
```bash
npm install && npm run dev
# Production: npm run build
```

### Database reset
```sql
DROP DATABASE IF EXISTS hostel_db;
CREATE DATABASE hostel_db;
USE hostel_db;
-- Run: schema.sql → seed.sql → performance.sql → hash fix
```

### Useful queries
```sql
-- All users with roles
SELECT u.full_name, u.email, r.role_name
FROM users u JOIN roles r ON u.role_id = r.role_id;

-- Reset beds for testing
SET SQL_SAFE_UPDATES = 0;
UPDATE beds SET status = 'available';
UPDATE rooms SET status = 'available', occupied_count = 0;
SET SQL_SAFE_UPDATES = 1;

-- Recent bookings
SELECT booking_id, user_id, bed_id, status FROM bookings ORDER BY created_at DESC LIMIT 10;
```

---

**Phase 1 — Database:** Complete ✅  
**Phase 2 — Backend API:** Complete ✅  
**Phase 3 — Frontend:** Complete ✅
