USE hostel_db;

-- 1. ROLES (4 records)
INSERT INTO roles (role_name, permissions) VALUES
('student', '{"can_book": true, "can_view_own": true, "can_pay": true}'),
('warden', '{"can_approve": true, "can_manage_maintenance": true, "can_view_hostel": true}'),
('hostel_owner', '{"can_manage_hostel": true, "can_view_revenue": true, "can_set_prices": true}'),
('super_admin', '{"can_manage_all": true, "can_delete": true, "can_configure": true}');

-- 2. USERS (35 records)
-- Students (25)
INSERT INTO users (role_id, email, password_hash, full_name, phone, city) VALUES
(1, 'ahmed.khan@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Ahmed Khan', '0300-1234567', 'Lahore'),
(1, 'fatima.ali@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Fatima Ali', '0321-9876543', 'Karachi'),
(1, 'usman.malik@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Usman Malik', '0333-1111222', 'Islamabad'),
(1, 'ayesha.hussain@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Ayesha Hussain', '0301-3334444', 'Lahore'),
(1, 'ali.raza@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Ali Raza', '0322-5556666', 'Karachi'),
(1, 'zainab.shah@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Zainab Shah', '0334-7778888', 'Islamabad'),
(1, 'hassan.ahmed@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Hassan Ahmed', '0302-9990000', 'Lahore'),
(1, 'maria.khan@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Maria Khan', '0323-1112222', 'Karachi'),
(1, 'bilal.sheikh@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Bilal Sheikh', '0335-3334444', 'Islamabad'),
(1, 'sana.iqbal@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Sana Iqbal', '0303-5556666', 'Lahore'),
(1, 'hamza.ali@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Hamza Ali', '0324-7778888', 'Karachi'),
(1, 'nida.khan@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Nida Khan', '0336-9990000', 'Islamabad'),
(1, 'kamran.siddiqui@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Kamran Siddiqui', '0304-1234567', 'Lahore'),
(1, 'hira.butt@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Hira Butt', '0325-9876543', 'Karachi'),
(1, 'faisal.mahmood@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Faisal Mahmood', '0337-1111222', 'Islamabad'),
(1, 'rabia.noor@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Rabia Noor', '0305-3334444', 'Lahore'),
(1, 'saad.hassan@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Saad Hassan', '0326-5556666', 'Karachi'),
(1, 'amna.tariq@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Amna Tariq', '0338-7778888', 'Islamabad'),
(1, 'omer.farooq@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Omer Farooq', '0306-9990000', 'Lahore'),
(1, 'nimra.asif@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Nimra Asif', '0327-1112222', 'Karachi'),
(1, 'talha.usman@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Talha Usman', '0339-3334444', 'Islamabad'),
(1, 'alina.ahmed@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Alina Ahmed', '0307-5556666', 'Lahore'),
(1, 'waqas.ali@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Waqas Ali', '0328-7778888', 'Karachi'),
(1, 'maham.khan@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Maham Khan', '0340-9990000', 'Islamabad'),
(1, 'shahzaib.hussain@gmail.com', '$2b$10$abcdefghijklmnopqrstuv', 'Shahzaib Hussain', '0308-1234567', 'Lahore'),

-- Wardens (6)
(2, 'warden.lhr1@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'Rashid Mahmood', '0311-1234567', 'Lahore'),
(2, 'warden.lhr2@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'Salma Bibi', '0311-9876543', 'Lahore'),
(2, 'warden.khi1@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'Tariq Aziz', '0311-1111222', 'Karachi'),
(2, 'warden.khi2@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'Uzma Khalid', '0311-3334444', 'Karachi'),
(2, 'warden.isl1@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'Nadeem Shah', '0311-5556666', 'Islamabad'),
(2, 'warden.isl2@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'Saira Malik', '0311-7778888', 'Islamabad'),

-- Hostel Owners (3)
(3, 'owner.excellence@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'Asif Khan', '0321-1234567', 'Lahore'),
(3, 'owner.comfort@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'Zahid Hussain', '0322-9876543', 'Karachi'),
(3, 'owner.paradise@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'Farhan Ahmed', '0323-1111222', 'Islamabad'),

-- Super Admin (1)
(4, 'admin@hostels.pk', '$2b$10$abcdefghijklmnopqrstuv', 'System Administrator', '0300-0000000', 'Lahore');

-- 3. HOSTEL_OWNERS (3 records)
INSERT INTO hostel_owners (user_id, company_name, business_license, bank_account, commission_rate) VALUES
(32, 'Excellence Hostels Pvt Ltd', 'LHR-2020-1234', 'PK12MEZN0001234567890123', 10.00),
(33, 'Comfort Living Properties', 'KHI-2019-5678', 'PK34HABB0009876543210987', 10.00),
(34, 'Paradise Accommodations', 'ISL-2021-9012', 'PK56UNIL0005555666677778', 10.00);

-- 4. HOSTELS (12 records - 4 per city)
INSERT INTO hostels (owner_user_id, hostel_name, city, address, latitude, longitude, gender, total_capacity, description, rating) VALUES
-- Lahore
(32, 'Excellence Boys Hostel - Gulberg', 'Lahore', 'Main Boulevard, Gulberg III, Lahore', 31.5204, 74.3587, 'male', 60, 'Premium hostel near LUMS and UET', 4.5),
(32, 'Excellence Girls Residence - DHA', 'Lahore', 'DHA Phase 5, Lahore', 31.4697, 74.4097, 'female', 48, 'Safe and comfortable for female students', 4.7),
(32, 'Budget Stay Hostel - Johar Town', 'Lahore', 'Block H, Johar Town, Lahore', 31.4697, 74.2728, 'male', 36, 'Affordable option for students', 4.0),
(32, 'Executive Hostel - Cantt', 'Lahore', 'Mall Road, Lahore Cantt', 31.5656, 74.3242, 'co-ed', 72, 'Modern facilities near city center', 4.6),

-- Karachi
(33, 'Comfort Boys Hostel - Clifton', 'Karachi', 'Block 8, Clifton, Karachi', 24.8138, 67.0299, 'male', 54, 'Near IBA and NED University', 4.4),
(33, 'Comfort Girls Hostel - Gulshan', 'Karachi', 'Gulshan-e-Iqbal, Block 13, Karachi', 24.9207, 67.0821, 'female', 42, 'Secure environment for female students', 4.6),
(33, 'Sea View Hostel - Defence', 'Karachi', 'DHA Phase 6, Karachi', 24.8015, 67.0659, 'male', 48, 'Spacious rooms with modern amenities', 4.5),
(33, 'Campus Hostel - University Road', 'Karachi', 'University Road, Karachi', 24.9458, 67.1182, 'co-ed', 60, 'Walking distance to multiple universities', 4.3),

-- Islamabad
(34, 'Paradise Boys Hostel - F-7', 'Islamabad', 'F-7 Markaz, Islamabad', 33.7294, 73.0550, 'male', 45, 'Near NUST and COMSATS', 4.7),
(34, 'Paradise Girls Residence - G-10', 'Islamabad', 'G-10/4, Islamabad', 33.6690, 73.0325, 'female', 36, 'Premium facilities for female students', 4.8),
(34, 'Green Valley Hostel - I-8', 'Islamabad', 'I-8 Markaz, Islamabad', 33.6657, 73.0758, 'male', 42, 'Peaceful environment, affordable rates', 4.2),
(34, 'Capital Hostel - Blue Area', 'Islamabad', 'Blue Area, Islamabad', 33.7077, 73.0515, 'co-ed', 66, 'Central location, excellent connectivity', 4.6);

-- 5. ROOM_CATEGORIES (5 records)
INSERT INTO room_categories (category_name, description, min_stay_days, max_stay_days, is_active) VALUES
('Daily Guest', 'For visitors, interns, short trips', 1, 7, TRUE),
('Weekly Stay', 'For training programs, short courses', 7, 30, TRUE),
('Monthly Tenant', 'For semester exchange, projects', 30, 90, TRUE),
('Semester Student', 'Full semester accommodation', 90, 180, TRUE),
('Annual Resident', 'Full academic year', 180, 365, TRUE);

-- 6. ROOMS (48 records - 4 rooms per hostel)
INSERT INTO rooms (hostel_id, room_number, floor_number, capacity, room_type, base_price_monthly, daily_rate, room_category_id, allows_short_term, status, has_attached_bathroom) VALUES
-- Hostel 1 (Lahore - Excellence Boys Gulberg)
(1, '101', 1, 3, 'triple', 12000, 600, 2, TRUE, 'available', TRUE),
(1, '102', 1, 3, 'triple', 12000, 600, 2, TRUE, 'available', TRUE),
(1, '201', 2, 2, 'double', 15000, 700, 2, TRUE, 'available', TRUE),
(1, '301', 3, 4, 'quad', 10000, NULL, 4, FALSE, 'available', FALSE),

-- Hostel 2 (Lahore - Excellence Girls DHA)
(2, '101', 1, 2, 'double', 16000, 750, 2, TRUE, 'available', TRUE),
(2, '102', 1, 2, 'double', 16000, 750, 2, TRUE, 'available', TRUE),
(2, '201', 2, 2, 'double', 16000, 750, 2, TRUE, 'available', TRUE),
(2, '301', 3, 3, 'triple', 13000, NULL, 4, FALSE, 'available', TRUE),

-- Hostel 3 (Lahore - Budget Stay Johar Town)
(3, '101', 1, 4, 'quad', 8000, 500, 2, TRUE, 'available', FALSE),
(3, '102', 1, 4, 'quad', 8000, 500, 2, TRUE, 'available', FALSE),
(3, '201', 2, 3, 'triple', 9000, NULL, 4, FALSE, 'available', FALSE),
(3, '301', 3, 3, 'triple', 9000, NULL, 4, FALSE, 'available', FALSE),

-- Hostel 4 (Lahore - Executive Cantt)
(4, '101', 1, 2, 'double', 18000, 850, 2, TRUE, 'available', TRUE),
(4, '102', 1, 2, 'double', 18000, 850, 2, TRUE, 'available', TRUE),
(4, '201', 2, 1, 'single', 22000, 1000, 2, TRUE, 'available', TRUE),
(4, '301', 3, 3, 'triple', 14000, NULL, 4, FALSE, 'available', TRUE),

-- Hostel 5 (Karachi - Comfort Boys Clifton)
(5, '101', 1, 3, 'triple', 11000, 550, 2, TRUE, 'available', TRUE),
(5, '102', 1, 3, 'triple', 11000, 550, 2, TRUE, 'available', TRUE),
(5, '201', 2, 2, 'double', 14000, 650, 2, TRUE, 'available', TRUE),
(5, '301', 3, 4, 'quad', 9000, NULL, 4, FALSE, 'available', FALSE),

-- Hostel 6 (Karachi - Comfort Girls Gulshan)
(6, '101', 1, 2, 'double', 15000, 700, 2, TRUE, 'available', TRUE),
(6, '102', 1, 2, 'double', 15000, 700, 2, TRUE, 'available', TRUE),
(6, '201', 2, 2, 'double', 15000, 700, 2, TRUE, 'available', TRUE),
(6, '301', 3, 3, 'triple', 12000, NULL, 4, FALSE, 'available', TRUE),

-- Hostel 7 (Karachi - Sea View Defence)
(7, '101', 1, 2, 'double', 17000, 800, 2, TRUE, 'available', TRUE),
(7, '102', 1, 2, 'double', 17000, 800, 2, TRUE, 'available', TRUE),
(7, '201', 2, 1, 'single', 20000, 950, 2, TRUE, 'available', TRUE),
(7, '301', 3, 3, 'triple', 13000, NULL, 4, FALSE, 'available', TRUE),

-- Hostel 8 (Karachi - Campus University Road)
(8, '101', 1, 4, 'quad', 9000, 500, 2, TRUE, 'available', FALSE),
(8, '102', 1, 4, 'quad', 9000, 500, 2, TRUE, 'available', FALSE),
(8, '201', 2, 3, 'triple', 10000, NULL, 4, FALSE, 'available', FALSE),
(8, '301', 3, 3, 'triple', 10000, NULL, 4, FALSE, 'available', FALSE),

-- Hostel 9 (Islamabad - Paradise Boys F-7)
(9, '101', 1, 2, 'double', 16000, 750, 2, TRUE, 'available', TRUE),
(9, '102', 1, 2, 'double', 16000, 750, 2, TRUE, 'available', TRUE),
(9, '201', 2, 2, 'double', 16000, 750, 2, TRUE, 'available', TRUE),
(9, '301', 3, 3, 'triple', 13000, NULL, 4, FALSE, 'available', TRUE),

-- Hostel 10 (Islamabad - Paradise Girls G-10)
(10, '101', 1, 2, 'double', 17000, 800, 2, TRUE, 'available', TRUE),
(10, '102', 1, 2, 'double', 17000, 800, 2, TRUE, 'available', TRUE),
(10, '201', 2, 1, 'single', 21000, 950, 2, TRUE, 'available', TRUE),
(10, '301', 3, 2, 'double', 14000, NULL, 4, FALSE, 'available', TRUE),

-- Hostel 11 (Islamabad - Green Valley I-8)
(11, '101', 1, 3, 'triple', 10000, 550, 2, TRUE, 'available', FALSE),
(11, '102', 1, 3, 'triple', 10000, 550, 2, TRUE, 'available', FALSE),
(11, '201', 2, 4, 'quad', 8500, NULL, 4, FALSE, 'available', FALSE),
(11, '301', 3, 4, 'quad', 8500, NULL, 4, FALSE, 'available', FALSE),

-- Hostel 12 (Islamabad - Capital Blue Area)
(12, '101', 1, 2, 'double', 19000, 900, 2, TRUE, 'available', TRUE),
(12, '102', 1, 2, 'double', 19000, 900, 2, TRUE, 'available', TRUE),
(12, '201', 2, 1, 'single', 23000, 1100, 2, TRUE, 'available', TRUE),
(12, '301', 3, 3, 'triple', 15000, NULL, 4, FALSE, 'available', TRUE);

-- 7. BEDS (144 records - 3 beds per room average)
INSERT INTO beds (room_id, bed_number, bed_type, status) VALUES
-- Room 1 (3 beds)
(1, 1, 'single', 'available'), (1, 2, 'single', 'available'), (1, 3, 'single', 'available'),
-- Room 2 (3 beds)
(2, 1, 'single', 'available'), (2, 2, 'single', 'available'), (2, 3, 'single', 'available'),
-- Room 3 (2 beds)
(3, 1, 'single', 'available'), (3, 2, 'single', 'available'),
-- Room 4 (4 beds)
(4, 1, 'bunk_lower', 'available'), (4, 2, 'bunk_upper', 'available'), (4, 3, 'bunk_lower', 'available'), (4, 4, 'bunk_upper', 'available'),
-- Room 5 (2 beds)
(5, 1, 'single', 'available'), (5, 2, 'single', 'available'),
-- Room 6 (2 beds)
(6, 1, 'single', 'available'), (6, 2, 'single', 'available'),
-- Room 7 (2 beds)
(7, 1, 'single', 'available'), (7, 2, 'single', 'available'),
-- Room 8 (3 beds)
(8, 1, 'single', 'available'), (8, 2, 'single', 'available'), (8, 3, 'single', 'available'),
-- Room 9 (4 beds)
(9, 1, 'bunk_lower', 'available'), (9, 2, 'bunk_upper', 'available'), (9, 3, 'bunk_lower', 'available'), (9, 4, 'bunk_upper', 'available'),
-- Room 10 (4 beds)
(10, 1, 'bunk_lower', 'available'), (10, 2, 'bunk_upper', 'available'), (10, 3, 'bunk_lower', 'available'), (10, 4, 'bunk_upper', 'available'),
-- Room 11 (3 beds)
(11, 1, 'single', 'available'), (11, 2, 'single', 'available'), (11, 3, 'single', 'available'),
-- Room 12 (3 beds)
(12, 1, 'single', 'available'), (12, 2, 'single', 'available'), (12, 3, 'single', 'available'),
-- Room 13 (2 beds)
(13, 1, 'single', 'available'), (13, 2, 'single', 'available'),
-- Room 14 (2 beds)
(14, 1, 'single', 'available'), (14, 2, 'single', 'available'),
-- Room 15 (2 beds)
(15, 1, 'single', 'available'), (15, 2, 'single', 'available'),
-- Room 16 (3 beds)
(16, 1, 'single', 'available'), (16, 2, 'single', 'available'), (16, 3, 'single', 'available'),
-- Room 17 (3 beds)
(17, 1, 'single', 'available'), (17, 2, 'single', 'available'), (17, 3, 'single', 'available'),
-- Room 18 (3 beds)
(18, 1, 'single', 'available'), (18, 2, 'single', 'available'), (18, 3, 'single', 'available'),
-- Room 19 (2 beds)
(19, 1, 'single', 'available'), (19, 2, 'single', 'available'),
-- Room 20 (4 beds)
(20, 1, 'bunk_lower', 'available'), (20, 2, 'bunk_upper', 'available'), (20, 3, 'bunk_lower', 'available'), (20, 4, 'bunk_upper', 'available'),
-- Room 21 (2 beds)
(21, 1, 'single', 'available'), (21, 2, 'single', 'available'),
-- Room 22 (2 beds)
(22, 1, 'single', 'available'), (22, 2, 'single', 'available'),
-- Room 23 (2 beds)
(23, 1, 'single', 'available'), (23, 2, 'single', 'available'),
-- Room 24 (3 beds)
(24, 1, 'single', 'available'), (24, 2, 'single', 'available'), (24, 3, 'single', 'available'),
-- Room 25 (2 beds)
(25, 1, 'single', 'available'), (25, 2, 'single', 'available'),
-- Room 26 (2 beds)
(26, 1, 'single', 'available'), (26, 2, 'single', 'available'),
-- Room 27 (1 bed)
(27, 1, 'single', 'available'),
-- Room 28 (3 beds)
(28, 1, 'single', 'available'), (28, 2, 'single', 'available'), (28, 3, 'single', 'available'),
-- Room 29 (4 beds)
(29, 1, 'bunk_lower', 'available'), (29, 2, 'bunk_upper', 'available'), (29, 3, 'bunk_lower', 'available'), (29, 4, 'bunk_upper', 'available'),
-- Room 30 (4 beds)
(30, 1, 'bunk_lower', 'available'), (30, 2, 'bunk_upper', 'available'), (30, 3, 'bunk_lower', 'available'), (30, 4, 'bunk_upper', 'available'),
-- Room 31 (3 beds)
(31, 1, 'single', 'available'), (31, 2, 'single', 'available'), (31, 3, 'single', 'available'),
-- Room 32 (3 beds)
(32, 1, 'single', 'available'), (32, 2, 'single', 'available'), (32, 3, 'single', 'available'),
-- Room 33 (2 beds)
(33, 1, 'single', 'available'), (33, 2, 'single', 'available'),
-- Room 34 (2 beds)
(34, 1, 'single', 'available'), (34, 2, 'single', 'available'),
-- Room 35 (2 beds)
(35, 1, 'single', 'available'), (35, 2, 'single', 'available'),
-- Room 36 (3 beds)
(36, 1, 'single', 'available'), (36, 2, 'single', 'available'), (36, 3, 'single', 'available'),
-- Room 37 (2 beds)
(37, 1, 'single', 'available'), (37, 2, 'single', 'available'),
-- Room 38 (2 beds)
(38, 1, 'single', 'available'), (38, 2, 'single', 'available'),
-- Room 39 (1 bed)
(39, 1, 'single', 'available'),
-- Room 40 (2 beds)
(40, 1, 'single', 'available'), (40, 2, 'single', 'available'),
-- Room 41 (3 beds)
(41, 1, 'single', 'available'), (41, 2, 'single', 'available'), (41, 3, 'single', 'available'),
-- Room 42 (3 beds)
(42, 1, 'single', 'available'), (42, 2, 'single', 'available'), (42, 3, 'single', 'available'),
-- Room 43 (4 beds)
(43, 1, 'bunk_lower', 'available'), (43, 2, 'bunk_upper', 'available'), (43, 3, 'bunk_lower', 'available'), (43, 4, 'bunk_upper', 'available'),
-- Room 44 (4 beds)
(44, 1, 'bunk_lower', 'available'), (44, 2, 'bunk_upper', 'available'), (44, 3, 'bunk_lower', 'available'), (44, 4, 'bunk_upper', 'available'),
-- Room 45 (2 beds)
(45, 1, 'single', 'available'), (45, 2, 'single', 'available'),
-- Room 46 (2 beds)
(46, 1, 'single', 'available'), (46, 2, 'single', 'available'),
-- Room 47 (1 bed)
(47, 1, 'single', 'available'),
-- Room 48 (3 beds)
(48, 1, 'single', 'available'), (48, 2, 'single', 'available'), (48, 3, 'single', 'available');

-- 8. AMENITIES (6 records)
INSERT INTO amenities (amenity_name, description, base_price_monthly, category) VALUES
('Air Conditioning', 'Room AC for summer comfort', 2000, 'comfort'),
('Mini Fridge', 'Personal mini refrigerator', 1500, 'utility'),
('Premium WiFi', 'High-speed internet 100 Mbps', 1000, 'utility'),
('Study Table & Chair', 'Dedicated study furniture', 500, 'comfort'),
('Laundry Service', 'Weekly laundry cleaning', 800, 'service'),
('Gym Membership', 'Access to hostel gym', 1200, 'service');

-- 9. HOSTEL_AMENITIES (60 records)
INSERT INTO hostel_amenities (hostel_id, amenity_id, available_count, price_override, is_active) VALUES
-- Hostel 1
(1, 1, 15, 2200, TRUE), (1, 2, 20, 1600, TRUE), (1, 3, 25, 1100, TRUE), (1, 4, 30, 550, TRUE), (1, 5, 10, 850, TRUE),
-- Hostel 2
(2, 1, 12, 2300, TRUE), (2, 2, 18, 1700, TRUE), (2, 3, 20, 1150, TRUE), (2, 4, 25, 600, TRUE), (2, 6, 15, 1300, TRUE),
-- Hostel 3
(3, 2, 10, 1400, TRUE), (3, 3, 15, 900, TRUE), (3, 4, 20, 450, TRUE), (3, 5, 8, 750, TRUE),
-- Hostel 4
(4, 1, 20, 2400, TRUE), (4, 2, 25, 1800, TRUE), (4, 3, 30, 1200, TRUE), (4, 4, 35, 650, TRUE), (4, 6, 18, 1400, TRUE),
-- Hostel 5
(5, 1, 14, 2100, TRUE), (5, 2, 18, 1550, TRUE), (5, 3, 22, 1050, TRUE), (5, 4, 28, 520, TRUE), (5, 5, 12, 800, TRUE),
-- Hostel 6
(6, 1, 10, 2200, TRUE), (6, 2, 15, 1650, TRUE), (6, 3, 18, 1100, TRUE), (6, 4, 22, 580, TRUE), (6, 6, 14, 1250, TRUE),
-- Hostel 7
(7, 1, 16, 2350, TRUE), (7, 2, 20, 1750, TRUE), (7, 3, 24, 1150, TRUE), (7, 4, 30, 600, TRUE), (7, 6, 16, 1350, TRUE),
-- Hostel 8
(8, 2, 12, 1450, TRUE), (8, 3, 16, 950, TRUE), (8, 4, 22, 480, TRUE), (8, 5, 10, 780, TRUE),
-- Hostel 9
(9, 1, 14, 2250, TRUE), (9, 2, 18, 1650, TRUE), (9, 3, 22, 1100, TRUE), (9, 4, 26, 560, TRUE), (9, 6, 15, 1300, TRUE),
-- Hostel 10
(10, 1, 12, 2400, TRUE), (10, 2, 16, 1750, TRUE), (10, 3, 20, 1150, TRUE), (10, 4, 24, 620, TRUE), (10, 6, 14, 1350, TRUE),
-- Hostel 11
(11, 2, 10, 1400, TRUE), (11, 3, 14, 950, TRUE), (11, 4, 18, 470, TRUE), (11, 5, 8, 770, TRUE),
-- Hostel 12
(12, 1, 18, 2500, TRUE), (12, 2, 22, 1850, TRUE), (12, 3, 28, 1250, TRUE), (12, 4, 32, 650, TRUE), (12, 6, 20, 1450, TRUE);

-- 10. MEAL_PLANS (12 records)
INSERT INTO meal_plans (hostel_id, plan_name, description, breakfast, lunch, dinner, price_monthly) VALUES
(1, 'Breakfast Only', 'Morning tea and paratha', TRUE, FALSE, FALSE, 3000),
(2, 'Two Meals', 'Breakfast and Dinner', TRUE, FALSE, TRUE, 6000),
(3, 'Basic Plan', 'Breakfast and Lunch', TRUE, TRUE, FALSE, 5500),
(4, 'Full Board', 'All 3 meals included', TRUE, TRUE, TRUE, 8000),
(5, 'Breakfast Only', 'Morning tea and eggs', TRUE, FALSE, FALSE, 2800),
(6, 'Two Meals', 'Breakfast and Dinner', TRUE, FALSE, TRUE, 5800),
(7, 'Full Board', 'All 3 meals included', TRUE, TRUE, TRUE, 8500),
(8, 'Basic Plan', 'Breakfast and Lunch', TRUE, TRUE, FALSE, 5200),
(9, 'Two Meals', 'Breakfast and Dinner', TRUE, FALSE, TRUE, 6200),
(10, 'Full Board', 'All 3 meals with premium options', TRUE, TRUE, TRUE, 9000),
(11, 'Breakfast Only', 'Budget morning meal', TRUE, FALSE, FALSE, 2500),
(12, 'Full Board', 'Executive meal plan', TRUE, TRUE, TRUE, 9500);