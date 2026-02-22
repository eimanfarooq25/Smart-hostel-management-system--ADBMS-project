USE hostel_db;

EXPLAIN ANALYZE
SELECT 
    h.hostel_name,
    h.city,
    r.room_number,
    r.base_price_monthly,
    r.daily_rate,
    COUNT(b.bed_id) as available_beds
FROM hostels h
JOIN rooms r ON h.hostel_id = r.hostel_id
JOIN beds b ON r.room_id = b.room_id
WHERE h.city = 'Lahore' 
  AND b.status = 'available'
  AND r.status = 'available'
GROUP BY h.hostel_id, r.room_id
HAVING available_beds > 0
ORDER BY r.base_price_monthly ASC;

CREATE INDEX idx_hostels_city ON hostels(city);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_rooms_status ON rooms(status);

EXPLAIN ANALYZE
SELECT 
    h.hostel_name,
    h.city,
    r.room_number,
    r.base_price_monthly,
    r.daily_rate,
    COUNT(b.bed_id) as available_beds
FROM hostels h
JOIN rooms r ON h.hostel_id = r.hostel_id
JOIN beds b ON r.room_id = b.room_id
WHERE h.city = 'Lahore' 
  AND b.status = 'available'
  AND r.status = 'available'
GROUP BY h.hostel_id, r.room_id
HAVING available_beds > 0
ORDER BY r.base_price_monthly ASC;

EXPLAIN ANALYZE
SELECT 
    bk.booking_id,
    h.hostel_name,
    r.room_number,
    bk.booking_start_date,
    bk.booking_end_date,
    bk.base_price,
    bk.status,
    p.status as payment_status
FROM bookings bk
JOIN beds b ON bk.bed_id = b.bed_id
JOIN rooms r ON b.room_id = r.room_id
JOIN hostels h ON r.hostel_id = h.hostel_id
LEFT JOIN invoices inv ON bk.booking_id = inv.booking_id
LEFT JOIN payments p ON inv.invoice_id = p.invoice_id
WHERE bk.user_id = 1
ORDER BY bk.booking_start_date DESC;

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_dates ON bookings(booking_start_date, booking_end_date);

EXPLAIN ANALYZE
SELECT 
    bk.booking_id,
    h.hostel_name,
    r.room_number,
    bk.booking_start_date,
    bk.booking_end_date,
    bk.base_price,
    bk.status,
    p.status as payment_status
FROM bookings bk
JOIN beds b ON bk.bed_id = b.bed_id
JOIN rooms r ON b.room_id = r.room_id
JOIN hostels h ON r.hostel_id = h.hostel_id
LEFT JOIN invoices inv ON bk.booking_id = inv.booking_id
LEFT JOIN payments p ON inv.invoice_id = p.invoice_id
WHERE bk.user_id = 1
ORDER BY bk.booking_start_date DESC;

EXPLAIN ANALYZE
SELECT 
    u.full_name,
    u.email,
    h.hostel_name,
    inv.invoice_number,
    inv.amount_due,
    inv.amount_paid,
    inv.due_date,
    DATEDIFF(CURRENT_DATE, inv.due_date) as days_overdue
FROM invoices inv
JOIN users u ON inv.user_id = u.user_id
JOIN bookings bk ON inv.booking_id = bk.booking_id
JOIN beds b ON bk.bed_id = b.bed_id
JOIN rooms r ON b.room_id = r.room_id
JOIN hostels h ON r.hostel_id = h.hostel_id
WHERE inv.status IN ('pending', 'overdue')
  AND inv.due_date < CURRENT_DATE
ORDER BY inv.due_date ASC;

CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

EXPLAIN ANALYZE
SELECT 
    u.full_name,
    u.email,
    h.hostel_name,
    inv.invoice_number,
    inv.amount_due,
    inv.amount_paid,
    inv.due_date,
    DATEDIFF(CURRENT_DATE, inv.due_date) as days_overdue
FROM invoices inv
JOIN users u ON inv.user_id = u.user_id
JOIN bookings bk ON inv.booking_id = bk.booking_id
JOIN beds b ON bk.bed_id = b.bed_id
JOIN rooms r ON b.room_id = r.room_id
JOIN hostels h ON r.hostel_id = h.hostel_id
WHERE inv.status IN ('pending', 'overdue')
  AND inv.due_date < CURRENT_DATE
ORDER BY inv.due_date ASC;

EXPLAIN ANALYZE
SELECT 
    a.amenity_name,
    COUNT(DISTINCT ba.booking_id) as total_bookings,
    SUM(ba.monthly_price) as total_revenue,
    h.city
FROM amenities a
JOIN booking_amenities ba ON a.amenity_id = ba.amenity_id
JOIN bookings bk ON ba.booking_id = bk.booking_id
JOIN beds b ON bk.bed_id = b.bed_id
JOIN rooms r ON b.room_id = r.room_id
JOIN hostels h ON r.hostel_id = h.hostel_id
WHERE bk.status = 'confirmed'
  AND bk.booking_start_date >= '2026-01-01'
GROUP BY a.amenity_id, h.city
ORDER BY total_revenue DESC;

CREATE INDEX idx_bookings_status_date ON bookings(status, booking_start_date);

EXPLAIN ANALYZE
SELECT 
    a.amenity_name,
    COUNT(DISTINCT ba.booking_id) as total_bookings,
    SUM(ba.monthly_price) as total_revenue,
    h.city
FROM amenities a
JOIN booking_amenities ba ON a.amenity_id = ba.amenity_id
JOIN bookings bk ON ba.booking_id = bk.booking_id
JOIN beds b ON bk.bed_id = b.bed_id
JOIN rooms r ON b.room_id = r.room_id
JOIN hostels h ON r.hostel_id = h.hostel_id
WHERE bk.status = 'confirmed'
  AND bk.booking_start_date >= '2026-01-01'
GROUP BY a.amenity_id, h.city
ORDER BY total_revenue DESC;

CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_amenity_category ON amenities(category);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_hostel_amenities_active ON hostel_amenities(hostel_id, is_active);

SHOW INDEX FROM hostels;
SHOW INDEX FROM bookings;
SHOW INDEX FROM beds;
SHOW INDEX FROM invoices;

ANALYZE TABLE hostels;
ANALYZE TABLE bookings;
ANALYZE TABLE beds;
ANALYZE TABLE invoices;