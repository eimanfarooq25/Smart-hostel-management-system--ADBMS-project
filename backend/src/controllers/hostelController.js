const pool = require('../config/database');

// Get all hostels (with optional city filter)
const getAllHostels = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { city, gender } = req.query;
    
    let query = 'SELECT * FROM hostels WHERE 1=1';
    const params = [];
    
    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }
    
    if (gender) {
      query += ' AND gender = ?';
      params.push(gender);
    }
    
    query += ' ORDER BY rating DESC';
    
    const [hostels] = await connection.query(query, params);
    
    res.json({
      count: hostels.length,
      hostels: hostels
    });
    
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch hostels',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

// Get hostel by ID
const getHostelById = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { hostel_id } = req.params;
    
    const [hostels] = await connection.query(
      'SELECT * FROM hostels WHERE hostel_id = ?',
      [hostel_id]
    );
    
    if (hostels.length === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    // Get hostel amenities
    const [amenities] = await connection.query(
      `SELECT a.amenity_id, a.amenity_name, a.category, 
              ha.available_count, ha.price_override, ha.is_active
       FROM hostel_amenities ha
       JOIN amenities a ON ha.amenity_id = a.amenity_id
       WHERE ha.hostel_id = ? AND ha.is_active = TRUE`,
      [hostel_id]
    );
    
    // Get meal plans
    const [mealPlans] = await connection.query(
      'SELECT * FROM meal_plans WHERE hostel_id = ?',
      [hostel_id]
    );
    
    res.json({
      hostel: hostels[0],
      amenities: amenities,
      meal_plans: mealPlans
    });
    
  } catch (error) {
    console.error('Get hostel error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch hostel',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

// Get rooms in a hostel
const getRoomsByHostel = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { hostel_id } = req.params;
    const { floor, status, room_type } = req.query;
    
    let query = `
      SELECT r.*, 
             (SELECT COUNT(*) FROM beds WHERE room_id = r.room_id AND status = 'available') as available_beds
      FROM rooms r
      WHERE r.hostel_id = ?
    `;
    const params = [hostel_id];
    
    if (floor) {
      query += ' AND r.floor_number = ?';
      params.push(floor);
    }
    
    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    
    if (room_type) {
      query += ' AND r.room_type = ?';
      params.push(room_type);
    }
    
    query += ' ORDER BY r.floor_number, r.room_number';
    
    const [rooms] = await connection.query(query, params);
    
    res.json({
      count: rooms.length,
      rooms: rooms
    });
    
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rooms',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

// Get available beds in a room
const getAvailableBeds = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { room_id } = req.params;
    
    const [beds] = await connection.query(
      `SELECT b.*, r.room_number, r.floor_number, h.hostel_name
       FROM beds b
       JOIN rooms r ON b.room_id = r.room_id
       JOIN hostels h ON r.hostel_id = h.hostel_id
       WHERE b.room_id = ? AND b.status = 'available'
       ORDER BY b.bed_number`,
      [room_id]
    );
    
    res.json({
      count: beds.length,
      beds: beds
    });
    
  } catch (error) {
    console.error('Get beds error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch beds',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllHostels,
  getHostelById,
  getRoomsByHostel,
  getAvailableBeds
};