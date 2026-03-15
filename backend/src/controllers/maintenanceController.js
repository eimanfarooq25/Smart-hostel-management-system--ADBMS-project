const pool = require('../config/database');
const createMaintenanceRequest = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { room_id, issue_description, priority } = req.body;
    const user_id = req.user.user_id;
    
    const [result] = await connection.query(
      'INSERT INTO maintenance_requests (room_id, reported_by, issue_description, priority, status) VALUES (?, ?, ?, ?, ?)',
      [room_id, user_id, issue_description, priority || 'medium', 'open']
    );
    
    console.log(`Maintenance request created: ID ${result.insertId} for room ${room_id}`);
    
    res.status(201).json({
      message: 'Maintenance request created successfully',
      request_id: result.insertId
    });
    
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({ 
      error: 'Failed to create maintenance request',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const getMaintenanceRequests = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { status, priority, room_id } = req.query;
    
    let query = `
      SELECT mr.*, r.room_number, r.floor_number, h.hostel_name,
             u.full_name as reported_by_name
      FROM maintenance_requests mr
      JOIN rooms r ON mr.room_id = r.room_id
      JOIN hostels h ON r.hostel_id = h.hostel_id
      JOIN users u ON mr.reported_by = u.user_id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND mr.status = ?';
      params.push(status);
    }
    
    if (priority) {
      query += ' AND mr.priority = ?';
      params.push(priority);
    }
    
    if (room_id) {
      query += ' AND mr.room_id = ?';
      params.push(room_id);
    }
    
    query += ' ORDER BY FIELD(mr.priority, "urgent", "high", "medium", "low"), mr.created_at DESC';
    
    const [requests] = await connection.query(query, params);
    
    res.json({
      count: requests.length,
      requests: requests
    });
    
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch maintenance requests',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const getMaintenanceRequestById = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { request_id } = req.params;
    
    const [requests] = await connection.query(
      `SELECT mr.*, r.room_number, r.floor_number, h.hostel_name,
              u.full_name as reported_by_name
       FROM maintenance_requests mr
       JOIN rooms r ON mr.room_id = r.room_id
       JOIN hostels h ON r.hostel_id = h.hostel_id
       JOIN users u ON mr.reported_by = u.user_id
       WHERE mr.request_id = ?`,
      [request_id]
    );
    
    if (requests.length === 0) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    
    res.json({ request: requests[0] });
    
  } catch (error) {
    console.error('Get maintenance request error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch maintenance request',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const updateMaintenanceStatus = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { request_id } = req.params;
    const { status } = req.body;
    
    const updateData = { status };
    if (status === 'resolved') {
      updateData.resolved_at = new Date();
    }
    
    const [result] = await connection.query(
      'UPDATE maintenance_requests SET status = ?, resolved_at = ? WHERE request_id = ?',
      [status, updateData.resolved_at || null, request_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    
    res.json({ 
      message: 'Maintenance request status updated successfully',
      status: status
    });
    
  } catch (error) {
    console.error('Update maintenance status error:', error);
    res.status(500).json({ 
      error: 'Failed to update maintenance request',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceStatus
};