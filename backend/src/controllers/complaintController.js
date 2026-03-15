const pool = require('../config/database');
const submitComplaint = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { hostel_id, category, subject, description, priority, is_anonymous } = req.body;
    const user_id = req.user.user_id;
    
    const [result] = await connection.query(
      `INSERT INTO complaints 
       (user_id, hostel_id, category, subject, description, priority, is_anonymous, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, hostel_id, category, subject, description, priority || 'medium', is_anonymous || false, 'open']
    );
    
    console.log(`New complaint submitted: ID ${result.insertId} by user ${user_id}`);
    
    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint_id: result.insertId
    });
    
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ 
      error: 'Failed to submit complaint',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const getComplaints = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const user_role = req.user.role;
    const user_id = req.user.user_id;
    const { status, category, hostel_id } = req.query;
    
    let query = `
      SELECT c.*, h.hostel_name, h.city,
             CASE WHEN c.is_anonymous = TRUE THEN 'Anonymous' ELSE u.full_name END as complainant_name
      FROM complaints c
      JOIN hostels h ON c.hostel_id = h.hostel_id
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    if (user_role === 'student') {
      query += ' AND c.user_id = ?';
      params.push(user_id);
    }
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND c.category = ?';
      params.push(category);
    }
    if (hostel_id) {
      query += ' AND c.hostel_id = ?';
      params.push(hostel_id);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const [complaints] = await connection.query(query, params);
    
    res.json({
      count: complaints.length,
      complaints: complaints
    });
    
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch complaints',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const getComplaintById = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { complaint_id } = req.params;
    const user_role = req.user.role;
    const user_id = req.user.user_id;
    
    let query = `
      SELECT c.*, h.hostel_name, h.city,
             CASE WHEN c.is_anonymous = TRUE THEN 'Anonymous' ELSE u.full_name END as complainant_name,
             resolver.full_name as resolved_by_name
      FROM complaints c
      JOIN hostels h ON c.hostel_id = h.hostel_id
      LEFT JOIN users u ON c.user_id = u.user_id
      LEFT JOIN users resolver ON c.resolved_by = resolver.user_id
      WHERE c.complaint_id = ?
    `;
    const params = [complaint_id];
    if (user_role === 'student') {
      query += ' AND c.user_id = ?';
      params.push(user_id);
    }
    
    const [complaints] = await connection.query(query, params);
    
    if (complaints.length === 0) {
      return res.status(404).json({ error: 'Complaint not found or access denied' });
    }
    
    res.json({ complaint: complaints[0] });
    
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch complaint',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

const updateComplaintStatus = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { complaint_id } = req.params;
    const { status } = req.body;
    const user_id = req.user.user_id;
    
    const updateData = { status };
    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_by = user_id;
      updateData.resolved_at = new Date();
    }
    
    const [result] = await connection.query(
      'UPDATE complaints SET status = ?, resolved_by = ?, resolved_at = ? WHERE complaint_id = ?',
      [status, updateData.resolved_by || null, updateData.resolved_at || null, complaint_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    res.json({ 
      message: 'Complaint status updated successfully',
      status: status
    });
    
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ 
      error: 'Failed to update complaint',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus
};