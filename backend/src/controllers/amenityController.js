const pool = require('../config/database');

// Get all amenities
const getAllAmenities = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [amenities] = await connection.query(
      'SELECT * FROM amenities ORDER BY category, amenity_name'
    );
    
    res.json({
      count: amenities.length,
      amenities: amenities
    });
    
  } catch (error) {
    console.error('Get amenities error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch amenities',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

// Get amenity by ID
const getAmenityById = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { amenity_id } = req.params;
    
    const [amenities] = await connection.query(
      'SELECT * FROM amenities WHERE amenity_id = ?',
      [amenity_id]
    );
    
    if (amenities.length === 0) {
      return res.status(404).json({ error: 'Amenity not found' });
    }
    
    res.json({ amenity: amenities[0] });
    
  } catch (error) {
    console.error('Get amenity error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch amenity',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

// Create amenity (owner/admin only)
const createAmenity = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { amenity_name, description, base_price_monthly, category, icon_url } = req.body;
    
    const [result] = await connection.query(
      'INSERT INTO amenities (amenity_name, description, base_price_monthly, category, icon_url) VALUES (?, ?, ?, ?, ?)',
      [amenity_name, description, base_price_monthly, category, icon_url]
    );
    
    res.status(201).json({
      message: 'Amenity created successfully',
      amenity_id: result.insertId
    });
    
  } catch (error) {
    console.error('Create amenity error:', error);
    res.status(500).json({ 
      error: 'Failed to create amenity',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

// Update amenity (owner/admin only)
const updateAmenity = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { amenity_id } = req.params;
    const { amenity_name, description, base_price_monthly, category, icon_url } = req.body;
    
    const [result] = await connection.query(
      'UPDATE amenities SET amenity_name = ?, description = ?, base_price_monthly = ?, category = ?, icon_url = ? WHERE amenity_id = ?',
      [amenity_name, description, base_price_monthly, category, icon_url, amenity_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Amenity not found' });
    }
    
    res.json({ message: 'Amenity updated successfully' });
    
  } catch (error) {
    console.error('Update amenity error:', error);
    res.status(500).json({ 
      error: 'Failed to update amenity',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

// Delete amenity (admin only)
const deleteAmenity = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { amenity_id } = req.params;
    
    const [result] = await connection.query(
      'DELETE FROM amenities WHERE amenity_id = ?',
      [amenity_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Amenity not found' });
    }
    
    res.json({ message: 'Amenity deleted successfully' });
    
  } catch (error) {
    console.error('Delete amenity error:', error);
    res.status(500).json({ 
      error: 'Failed to delete amenity',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllAmenities,
  getAmenityById,
  createAmenity,
  updateAmenity,
  deleteAmenity
};