const pool = require('../config/database');
const createBooking = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    console.log('=== BOOKING TRANSACTION STARTED ===');
    
    const { bed_id, booking_start_date, booking_end_date, amenity_ids } = req.body;
    const user_id = req.user.user_id;
    console.log(`Step 1: Locking bed ${bed_id} for booking`);
    const [beds] = await connection.query(
      'SELECT * FROM beds WHERE bed_id = ? AND status = ? FOR UPDATE',
      [bed_id, 'available']
    );
    
    if (beds.length === 0) {
      throw new Error('Bed not available for booking');
    }
    console.log('✓ Bed is available and locked');
    const [rooms] = await connection.query(
    `SELECT r.base_price_monthly, r.daily_rate, r.floor_number, 
            r.allows_short_term
    FROM rooms r
    JOIN beds b ON r.room_id = b.room_id
    WHERE b.bed_id = ?`,
    [bed_id]
    );
    
    if (rooms.length === 0) {
      throw new Error('Room not found');
    }
    
    const room = rooms[0];
    console.log(`✓ Room found - Floor ${room.floor_number}, Price: ${room.base_price_monthly}/month`);
    const startDate = new Date(booking_start_date);
    const endDate = new Date(booking_end_date);
    const stayDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (stayDays <= 0) {
      throw new Error('Invalid date range - end date must be after start date');
    }
    
    console.log(`✓ Stay duration: ${stayDays} days`);
    let stayCategory;
    let basePrice;
    
    if (stayDays <= 7) {
      stayCategory = 'daily';
      basePrice = room.daily_rate ? room.daily_rate * stayDays : (room.base_price_monthly / 30) * stayDays;
    } else if (stayDays <= 30) {
      stayCategory = 'weekly';
      basePrice = (room.base_price_monthly / 30) * stayDays;
    } else if (stayDays <= 120) {
      stayCategory = 'monthly';
      basePrice = room.base_price_monthly * Math.ceil(stayDays / 30);
    } else {
      stayCategory = 'semester';
      basePrice = room.base_price_monthly * 4;
    }
    
    console.log(`✓ Stay category: ${stayCategory}, Base price: ${basePrice} PKR`);
    if (stayDays < 30 && room.floor_number > 2) {
      throw new Error('Short-term stays (under 30 days) must be on floors 1-2');
    }
    
    if (stayDays > 90 && room.floor_number <= 2) {
      throw new Error('Long-term stays (over 90 days) must be on floors 3 or higher');
    }
    
    if (stayDays < 30 && !room.allows_short_term) {
      throw new Error('This room does not accept short-term bookings');
    }
    
    console.log('✓ Floor allocation validated');
    console.log('Step 2: Creating booking record');
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings 
       (user_id, bed_id, booking_start_date, booking_end_date, base_price, 
        stay_duration_days, stay_category, status, payment_deadline) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 48 HOUR))`,
      [user_id, bed_id, booking_start_date, booking_end_date, basePrice, 
       stayDays, stayCategory, 'pending']
    );
    
    const bookingId = bookingResult.insertId;
    console.log(`✓ Booking created - ID: ${bookingId}`);
    let totalAmenitiesPrice = 0;
    
    if (amenity_ids && amenity_ids.length > 0) {
      console.log(`Step 3: Adding ${amenity_ids.length} amenities`);
      
      for (const amenityId of amenity_ids) {
        const [amenities] = await connection.query(
          `SELECT a.amenity_id, a.amenity_name, a.base_price_monthly, 
                  ha.available_count, ha.hostel_id
           FROM amenities a
           JOIN hostel_amenities ha ON a.amenity_id = ha.amenity_id
           JOIN rooms r ON ha.hostel_id = r.hostel_id
           JOIN beds b ON r.room_id = b.room_id
           WHERE b.bed_id = ? AND a.amenity_id = ? AND ha.is_active = TRUE`,
          [bed_id, amenityId]
        );
        
        if (amenities.length === 0) {
          throw new Error(`Amenity ${amenityId} not available at this hostel`);
        }
        
        if (amenities[0].available_count <= 0) {
          throw new Error(`Amenity "${amenities[0].amenity_name}" out of stock`);
        }
        
        const amenityPrice = amenities[0].base_price_monthly;
        const amenityCost = (amenityPrice / 30) * stayDays;
        totalAmenitiesPrice += amenityCost;
        await connection.query(
          'INSERT INTO booking_amenities (booking_id, amenity_id, monthly_price, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
          [bookingId, amenityId, amenityPrice, booking_start_date, booking_end_date]
        );
        
        console.log(`  ✓ Added amenity: ${amenities[0].amenity_name} - ${amenityCost.toFixed(2)} PKR`);
      }
      await connection.query(
        'UPDATE bookings SET total_amenities_price = ? WHERE booking_id = ?',
        [totalAmenitiesPrice, bookingId]
      );
      
      console.log(`✓ Total amenities cost: ${totalAmenitiesPrice.toFixed(2)} PKR`);
    }
    console.log('Step 4: Confirming booking');
    await connection.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      ['confirmed', bookingId]
    );
    const [finalBooking] = await connection.query(
      `SELECT b.*, bd.bed_number, bd.bed_type, r.room_number, h.hostel_name, h.city
       FROM bookings b
       JOIN beds bd ON b.bed_id = bd.bed_id
       JOIN rooms r ON bd.room_id = r.room_id
       JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );
    await connection.commit();
    console.log('=== BOOKING TRANSACTION COMMITTED ===');
    console.log('');
    
    const totalCost = basePrice + totalAmenitiesPrice;
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: finalBooking[0],
      pricing: {
        base_price: basePrice,
        amenities_price: totalAmenitiesPrice,
        total_cost: totalCost
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.log('=== BOOKING TRANSACTION ROLLED BACK ===');
    console.log(`Reason: ${error.message}`);
    console.log('');
    
    res.status(400).json({ 
      error: 'Booking failed', 
      details: error.message 
    });
    
  } finally {
    connection.release();
  }
};
const getUserBookings = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [bookings] = await connection.query(
      `SELECT b.*, h.hostel_name, h.city, r.room_number, bd.bed_number,
              (b.base_price + b.total_amenities_price) as total_cost
       FROM bookings b
       JOIN beds bd ON b.bed_id = bd.bed_id
       JOIN rooms r ON bd.room_id = r.room_id
       JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.user_id]
    );
    
    res.json({ 
      count: bookings.length,
      bookings: bookings 
    });
    
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bookings',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const getBookingById = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { booking_id } = req.params;
    
    const [bookings] = await connection.query(
      `SELECT b.*, h.hostel_name, h.city, r.room_number, bd.bed_number,
              (b.base_price + b.total_amenities_price) as total_cost
       FROM bookings b
       JOIN beds bd ON b.bed_id = bd.bed_id
       JOIN rooms r ON bd.room_id = r.room_id
       JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [booking_id, req.user.user_id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const [amenities] = await connection.query(
      `SELECT a.amenity_name, ba.monthly_price
       FROM booking_amenities ba
       JOIN amenities a ON ba.amenity_id = a.amenity_id
       WHERE ba.booking_id = ?`,
      [booking_id]
    );
    
    res.json({ 
      booking: bookings[0],
      amenities: amenities
    });
    
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch booking',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const cancelBooking = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { booking_id } = req.params;
    const user_id = req.user.user_id;
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [booking_id, user_id]
    );
    
    if (bookings.length === 0) {
      throw new Error('Booking not found or unauthorized');
    }
    
    const booking = bookings[0];
    
    if (booking.status === 'cancelled') {
      throw new Error('Booking already cancelled');
    }
    
    if (booking.status === 'completed') {
      throw new Error('Cannot cancel completed booking');
    }
    const hoursSinceBooking = (Date.now() - new Date(booking.created_at)) / (1000 * 60 * 60);
    
    if (hoursSinceBooking > 24) {
      throw new Error('Cancellation period expired (must cancel within 24 hours)');
    }
    await connection.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      ['cancelled', booking_id]
    );
    await connection.query(
      'UPDATE beds SET status = ? WHERE bed_id = ?',
      ['available', booking.bed_id]
    );
    
    await connection.commit();
    
    res.json({ 
      message: 'Booking cancelled successfully',
      booking_id: booking_id
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Cancel booking error:', error);
    res.status(400).json({ 
      error: 'Cancellation failed',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = { 
  createBooking, 
  getUserBookings,
  getBookingById,
  cancelBooking 
};