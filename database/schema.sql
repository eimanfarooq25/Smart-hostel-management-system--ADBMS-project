USE hostel_db;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS guest_registrations;
DROP TABLE IF EXISTS early_checkouts;
DROP TABLE IF EXISTS booking_extensions;
DROP TABLE IF EXISTS room_transfers;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS student_meal_subscriptions;
DROP TABLE IF EXISTS booking_amenities;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS hostel_amenities;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS beds;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS room_categories;
DROP TABLE IF EXISTS hostels;
DROP TABLE IF EXISTS hostel_owners;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name ENUM('student', 'warden', 'hostel_owner', 'super_admin') NOT NULL UNIQUE,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    INDEX idx_email (email),
    INDEX idx_role (role_id)
) ENGINE=InnoDB;

CREATE TABLE hostel_owners (
    owner_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(100),
    business_license VARCHAR(50),
    bank_account VARCHAR(30),
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE hostels (
    hostel_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_user_id INT NOT NULL,
    hostel_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    gender ENUM('male', 'female', 'co-ed') NOT NULL,
    total_capacity INT,
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(user_id),
    INDEX idx_city (city),
    INDEX idx_gender (gender),
    INDEX idx_owner (owner_user_id)
) ENGINE=InnoDB;

CREATE TABLE room_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    description TEXT,
    min_stay_days INT NOT NULL,
    max_stay_days INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    hostel_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    floor_number INT NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0 AND capacity <= 6),
    occupied_count INT DEFAULT 0,
    room_type ENUM('single', 'double', 'triple', 'quad') NOT NULL,
    base_price_monthly DECIMAL(10,2) NOT NULL,
    daily_rate DECIMAL(10,2),
    room_category_id INT,
    allows_short_term BOOLEAN DEFAULT FALSE,
    status ENUM('available', 'full', 'maintenance') DEFAULT 'available',
    has_attached_bathroom BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE,
    FOREIGN KEY (room_category_id) REFERENCES room_categories(category_id),
    UNIQUE KEY (hostel_id, room_number),
    INDEX idx_status (status),
    INDEX idx_floor (floor_number),
    INDEX idx_hostel (hostel_id)
) ENGINE=InnoDB;

CREATE TABLE beds (
    bed_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    bed_number INT NOT NULL,
    bed_type ENUM('single', 'bunk_upper', 'bunk_lower') DEFAULT 'single',
    status ENUM('available', 'occupied', 'maintenance', 'reserved') DEFAULT 'available',
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    UNIQUE KEY (room_id, bed_number),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE amenities (
    amenity_id INT PRIMARY KEY AUTO_INCREMENT,
    amenity_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    base_price_monthly DECIMAL(10,2) NOT NULL,
    category ENUM('comfort', 'utility', 'service', 'entertainment') NOT NULL,
    icon_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE hostel_amenities (
    hostel_amenity_id INT PRIMARY KEY AUTO_INCREMENT,
    hostel_id INT NOT NULL,
    amenity_id INT NOT NULL,
    available_count INT NOT NULL,
    price_override DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id),
    UNIQUE KEY (hostel_id, amenity_id),
    INDEX idx_hostel (hostel_id)
) ENGINE=InnoDB;

CREATE TABLE meal_plans (
    meal_plan_id INT PRIMARY KEY AUTO_INCREMENT,
    hostel_id INT NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    description TEXT,
    breakfast BOOLEAN DEFAULT FALSE,
    lunch BOOLEAN DEFAULT FALSE,
    dinner BOOLEAN DEFAULT FALSE,
    price_monthly DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    bed_id INT NOT NULL,
    booking_start_date DATE NOT NULL,
    booking_end_date DATE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    total_amenities_price DECIMAL(10,2) DEFAULT 0.00,
    stay_duration_days INT,
    stay_category ENUM('daily', 'weekly', 'monthly', 'semester') NOT NULL,
    status ENUM('confirmed', 'pending', 'cancelled', 'completed') DEFAULT 'pending',
    payment_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (bed_id) REFERENCES beds(bed_id),
    CHECK (booking_start_date < booking_end_date),
    INDEX idx_user (user_id),
    INDEX idx_dates (booking_start_date, booking_end_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE booking_amenities (
    booking_amenity_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amenity_id INT NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id),
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB;

CREATE TABLE student_meal_subscriptions (
    subscription_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    hostel_id INT NOT NULL,
    meal_plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id),
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(meal_plan_id),
    INDEX idx_user_active (user_id, status)
) ENGINE=InnoDB;

CREATE TABLE invoices (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    status ENUM('pending', 'partially_paid', 'paid', 'overdue') DEFAULT 'pending',
    late_fee DECIMAL(10,2) DEFAULT 0.00,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB;

CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    payment_method ENUM('cash', 'card', 'bank_transfer', 'easypaisa', 'jazzcash') NOT NULL,
    transaction_reference VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB;

CREATE TABLE room_transfers (
    transfer_id INT PRIMARY KEY AUTO_INCREMENT,
    old_booking_id INT NOT NULL,
    new_booking_id INT,
    student_user_id INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT,
    approved_at TIMESTAMP,
    FOREIGN KEY (old_booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (new_booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (student_user_id) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id),
    INDEX idx_student (student_user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE booking_extensions (
    extension_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    original_end_date DATE NOT NULL,
    new_end_date DATE NOT NULL,
    additional_days INT NOT NULL,
    additional_cost DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id),
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB;

CREATE TABLE early_checkouts (
    checkout_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    original_end_date DATE NOT NULL,
    actual_checkout_date DATE NOT NULL,
    days_unused INT NOT NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_status ENUM('pending', 'processed', 'no_refund') DEFAULT 'pending',
    reason TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB;

CREATE TABLE guest_registrations (
    guest_id INT PRIMARY KEY AUTO_INCREMENT,
    student_user_id INT NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20),
    relationship VARCHAR(50),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'checked_in', 'checked_out', 'rejected') DEFAULT 'pending',
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_user_id) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id),
    CHECK (check_in_date < check_out_date),
    INDEX idx_student (student_user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE maintenance_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    reported_by INT NOT NULL,
    issue_description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (reported_by) REFERENCES users(user_id),
    INDEX idx_status (status),
    INDEX idx_room (room_id)
) ENGINE=InnoDB;

CREATE TABLE complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    hostel_id INT NOT NULL,
    category ENUM('cleanliness', 'noise', 'staff', 'maintenance', 'food', 'security', 'other') NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id),
    FOREIGN KEY (resolved_by) REFERENCES users(user_id),
    INDEX idx_status (status),
    INDEX idx_hostel (hostel_id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('booking', 'payment', 'maintenance', 'complaint', 'general') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_unread (user_id, is_read)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_affected VARCHAR(50) NOT NULL,
    record_id INT,
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_table (table_affected)
) ENGINE=InnoDB;

DELIMITER //
CREATE TRIGGER prevent_overbooking
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE bed_current_status VARCHAR(20);
    SELECT status INTO bed_current_status FROM beds WHERE bed_id = NEW.bed_id;
    
    IF bed_current_status != 'available' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Bed is not available for booking';
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_room_occupancy
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE room_to_update INT;
    DECLARE room_cap INT;
    DECLARE current_occupied INT;
    
    SELECT room_id, capacity INTO room_to_update, room_cap 
    FROM beds WHERE bed_id = NEW.bed_id;
    
    UPDATE beds SET status = 'occupied' WHERE bed_id = NEW.bed_id;
    
    UPDATE rooms SET occupied_count = occupied_count + 1 
    WHERE room_id = room_to_update;
    
    SELECT occupied_count INTO current_occupied 
    FROM rooms WHERE room_id = room_to_update;
    
    IF current_occupied >= room_cap THEN
        UPDATE rooms SET status = 'full' WHERE room_id = room_to_update;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_amenity_inventory
AFTER INSERT ON booking_amenities
FOR EACH ROW
BEGIN
    DECLARE hostel_for_booking INT;
    
    SELECT h.hostel_id INTO hostel_for_booking
    FROM bookings b
    JOIN beds bd ON b.bed_id = bd.bed_id
    JOIN rooms r ON bd.room_id = r.room_id
    JOIN hostels h ON r.hostel_id = h.hostel_id
    WHERE b.booking_id = NEW.booking_id;
    
    UPDATE hostel_amenities 
    SET available_count = available_count - 1
    WHERE hostel_id = hostel_for_booking 
    AND amenity_id = NEW.amenity_id;
    
    IF (SELECT available_count FROM hostel_amenities 
        WHERE hostel_id = hostel_for_booking AND amenity_id = NEW.amenity_id) < 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Amenity out of stock';
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER auto_generate_invoice
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    DECLARE total_price DECIMAL(10,2);
    DECLARE invoice_num VARCHAR(50);
    
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
        
        SET total_price = NEW.base_price + NEW.total_amenities_price;
        
        SET invoice_num = CONCAT('INV-', YEAR(NOW()), '-', NEW.booking_id);
        
        INSERT INTO invoices (booking_id, user_id, invoice_number, amount_due, due_date)
        VALUES (NEW.booking_id, NEW.user_id, invoice_num, total_price, 
                DATE_ADD(NEW.booking_start_date, INTERVAL -7 DAY));
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER check_payment_deadline
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'pending' 
       AND TIMESTAMPDIFF(HOUR, NEW.created_at, NOW()) > 48 
       AND NEW.payment_deadline IS NOT NULL THEN
        
        SET NEW.status = 'cancelled';
        
        UPDATE beds SET status = 'available' WHERE bed_id = NEW.bed_id;
        
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (NEW.user_id, 'Booking Cancelled', 
                'Your booking was cancelled due to non-payment', 'booking');
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER prevent_wrong_floor_allocation
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE days INT;
    DECLARE room_floor INT;
    DECLARE allows_short BOOLEAN;
    
    SET days = DATEDIFF(NEW.booking_end_date, NEW.booking_start_date);
    
    SELECT r.floor_number, r.allows_short_term
    INTO room_floor, allows_short
    FROM rooms r
    JOIN beds b ON r.room_id = b.room_id
    WHERE b.bed_id = NEW.bed_id;
    
    IF days < 30 AND room_floor > 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Short-term stays must be on floors 1-2';
    END IF;
    
    IF days > 90 AND room_floor <= 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Long-term stays must be on floors 3 or higher';
    END IF;
    
    IF days < 30 AND allows_short = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This room does not accept short-term bookings';
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER mark_high_turnover
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE room_to_mark INT;
    DECLARE turnover_count INT;
    
    SELECT room_id INTO room_to_mark 
    FROM beds WHERE bed_id = NEW.bed_id;
    
    SELECT COUNT(*) INTO turnover_count
    FROM bookings b
    JOIN beds bd ON b.bed_id = bd.bed_id
    WHERE bd.room_id = room_to_mark
      AND b.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    IF turnover_count > 10 THEN
        INSERT INTO notifications (user_id, title, message, type)
        SELECT user_id, 'High Turnover Room', 
               CONCAT('Room ', room_to_mark, ' has high turnover - schedule deep cleaning'),
               'maintenance'
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE r.role_name = 'warden'
        LIMIT 1;
    END IF;
END//
DELIMITER ;

CREATE VIEW available_rooms_with_amenities AS
SELECT 
    h.hostel_id,
    h.hostel_name,
    h.city,
    h.address,
    r.room_id,
    r.room_number,
    r.floor_number,
    r.capacity,
    r.occupied_count,
    r.base_price_monthly,
    r.daily_rate,
    r.has_attached_bathroom,
    r.allows_short_term,
    COUNT(DISTINCT b.bed_id) as available_beds,
    GROUP_CONCAT(DISTINCT a.amenity_name) as available_amenities,
    h.rating
FROM hostels h
JOIN rooms r ON h.hostel_id = r.hostel_id
JOIN beds b ON r.room_id = b.room_id
LEFT JOIN hostel_amenities ha ON h.hostel_id = ha.hostel_id AND ha.available_count > 0 AND ha.is_active = TRUE
LEFT JOIN amenities a ON ha.amenity_id = a.amenity_id
WHERE r.status = 'available' AND b.status = 'available'
GROUP BY h.hostel_id, r.room_id
HAVING available_beds > 0;

CREATE VIEW owner_revenue_summary AS
SELECT 
    ho.owner_id,
    u.full_name as owner_name,
    h.hostel_name,
    h.city,
    COUNT(DISTINCT bk.booking_id) as total_bookings,
    SUM(p.amount) as total_revenue,
    SUM(p.amount * ho.commission_rate / 100) as platform_commission,
    SUM(p.amount * (1 - ho.commission_rate / 100)) as owner_earnings,
    DATE_FORMAT(p.payment_date, '%Y-%m') as month
FROM hostel_owners ho
JOIN users u ON ho.user_id = u.user_id
JOIN hostels h ON ho.owner_id = h.owner_user_id
JOIN rooms r ON h.hostel_id = r.hostel_id
JOIN beds bd ON r.room_id = bd.room_id
JOIN bookings bk ON bd.bed_id = bk.bed_id
JOIN invoices inv ON bk.booking_id = inv.booking_id
JOIN payments p ON inv.invoice_id = p.invoice_id
WHERE p.status = 'completed'
GROUP BY ho.owner_id, h.hostel_id, DATE_FORMAT(p.payment_date, '%Y-%m')
ORDER BY month DESC;

CREATE VIEW student_booking_history AS
SELECT 
    u.user_id,
    u.full_name as student_name,
    h.hostel_name,
    h.city,
    r.room_number,
    b.bed_number,
    bk.booking_start_date,
    bk.booking_end_date,
    bk.base_price,
    bk.total_amenities_price,
    (bk.base_price + bk.total_amenities_price) as total_cost,
    bk.stay_category,
    bk.status,
    GROUP_CONCAT(DISTINCT a.amenity_name) as selected_amenities,
    p.payment_date,
    p.status as payment_status
FROM users u
JOIN bookings bk ON u.user_id = bk.user_id
JOIN beds b ON bk.bed_id = b.bed_id
JOIN rooms r ON b.room_id = r.room_id
JOIN hostels h ON r.hostel_id = h.hostel_id
LEFT JOIN booking_amenities ba ON bk.booking_id = ba.booking_id
LEFT JOIN amenities a ON ba.amenity_id = a.amenity_id
LEFT JOIN invoices inv ON bk.booking_id = inv.booking_id
LEFT JOIN payments p ON inv.invoice_id = p.invoice_id
WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'student')
GROUP BY bk.booking_id
ORDER BY bk.created_at DESC;

CREATE VIEW hostel_occupancy_dashboard AS
SELECT 
    h.hostel_id,
    h.hostel_name,
    h.city,
    h.total_capacity,
    COUNT(DISTINCT r.room_id) as total_rooms,
    COUNT(DISTINCT b.bed_id) as total_beds,
    SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) as occupied_beds,
    SUM(CASE WHEN b.status = 'available' THEN 1 ELSE 0 END) as available_beds,
    ROUND((SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) / COUNT(b.bed_id) * 100), 2) as occupancy_percentage,
    COUNT(DISTINCT CASE WHEN bk.status = 'confirmed' THEN bk.booking_id END) as active_bookings
FROM hostels h
JOIN rooms r ON h.hostel_id = r.hostel_id
JOIN beds b ON r.room_id = b.room_id
LEFT JOIN bookings bk ON b.bed_id = bk.bed_id AND bk.status = 'confirmed'
GROUP BY h.hostel_id;

CREATE VIEW room_utilization_by_stay_type AS
SELECT 
    h.hostel_name,
    h.city,
    r.floor_number,
    rc.category_name,
    COUNT(DISTINCT r.room_id) as total_rooms,
    COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) as active_bookings,
    AVG(b.stay_duration_days) as avg_stay_days,
    SUM(CASE WHEN b.stay_category = 'daily' THEN 1 ELSE 0 END) as daily_bookings,
    SUM(CASE WHEN b.stay_category = 'weekly' THEN 1 ELSE 0 END) as weekly_bookings,
    SUM(CASE WHEN b.stay_category = 'monthly' THEN 1 ELSE 0 END) as monthly_bookings,
    SUM(CASE WHEN b.stay_category = 'semester' THEN 1 ELSE 0 END) as semester_bookings
FROM hostels h
JOIN rooms r ON h.hostel_id = r.hostel_id
LEFT JOIN room_categories rc ON r.room_category_id = rc.category_id
LEFT JOIN beds bd ON r.room_id = bd.room_id
LEFT JOIN bookings b ON bd.bed_id = b.bed_id
GROUP BY h.hostel_id, r.floor_number, rc.category_id;

CREATE VIEW short_term_availability AS
SELECT 
    h.hostel_name,
    h.city,
    r.room_number,
    r.floor_number,
    COUNT(b.bed_id) as available_beds,
    r.daily_rate,
    r.base_price_monthly,
    r.allows_short_term,
    GROUP_CONCAT(DISTINCT a.amenity_name) as available_amenities,
    CASE 
        WHEN r.floor_number <= 2 THEN 'Prime short-term location'
        ELSE 'Long-term preferred'
    END as recommendation
FROM hostels h
JOIN rooms r ON h.hostel_id = r.hostel_id
JOIN beds b ON r.room_id = b.room_id
LEFT JOIN hostel_amenities ha ON h.hostel_id = ha.hostel_id AND ha.is_active = TRUE
LEFT JOIN amenities a ON ha.amenity_id = a.amenity_id
WHERE r.allows_short_term = TRUE 
  AND b.status = 'available'
GROUP BY r.room_id
HAVING available_beds > 0;

CREATE INDEX idx_booking_dates_range ON bookings(booking_start_date, booking_end_date);

CREATE INDEX idx_payment_date ON payments(payment_date);

CREATE INDEX idx_amenity_category ON amenities(category);

CREATE INDEX idx_maintenance_status ON maintenance_requests(status, priority);