const pool = require('../config/database');
const registerGuest = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { guest_name, guest_phone, relationship, check_in_date, check_out_date } = req.body;
    const user_id = req.user.user_id;
    if (new Date(check_in_date) >= new Date(check_out_date)) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }
    
    const [result] = await connection.query(
      'INSERT INTO guest_registrations (student_user_id, guest_name, guest_phone, relationship, check_in_date, check_out_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, guest_name, guest_phone, relationship, check_in_date, check_out_date, 'pending']
    );
    
    console.log(`Guest registration submitted: ID ${result.insertId} by student ${user_id}`);
    
    res.status(201).json({
      message: 'Guest registration submitted successfully. Awaiting approval.',
      guest_id: result.insertId
    });
    
  } catch (error) {
    console.error('Register guest error:', error);
    res.status(500).json({ 
      error: 'Failed to register guest',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const getGuestRegistrations = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const user_role = req.user.role;
    const user_id = req.user.user_id;
    const { status } = req.query;
    
    let query = `
      SELECT gr.*, u.full_name as student_name, u.email as student_email,
             approver.full_name as approved_by_name
      FROM guest_registrations gr
      JOIN users u ON gr.student_user_id = u.user_id
      LEFT JOIN users approver ON gr.approved_by = approver.user_id
      WHERE 1=1
    `;
    const params = [];
    if (user_role === 'student') {
      query += ' AND gr.student_user_id = ?';
      params.push(user_id);
    }
    if (status) {
      query += ' AND gr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY gr.created_at DESC';
    
    const [registrations] = await connection.query(query, params);
    
    res.json({
      count: registrations.length,
      registrations: registrations
    });
    
  } catch (error) {
    console.error('Get guest registrations error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch guest registrations',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const getGuestRegistrationById = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { guest_id } = req.params;
    const user_role = req.user.role;
    const user_id = req.user.user_id;
    
    let query = `
      SELECT gr.*, u.full_name as student_name, u.email as student_email,
             approver.full_name as approved_by_name
      FROM guest_registrations gr
      JOIN users u ON gr.student_user_id = u.user_id
      LEFT JOIN users approver ON gr.approved_by = approver.user_id
      WHERE gr.guest_id = ?
    `;
    const params = [guest_id];
    if (user_role === 'student') {
      query += ' AND gr.student_user_id = ?';
      params.push(user_id);
    }
    
    const [registrations] = await connection.query(query, params);
    
    if (registrations.length === 0) {
      return res.status(404).json({ error: 'Guest registration not found or access denied' });
    }
    
    res.json({ registration: registrations[0] });
    
  } catch (error) {
    console.error('Get guest registration error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch guest registration',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

const updateGuestStatus = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { guest_id } = req.params;
    const { status } = req.body;
    const user_id = req.user.user_id;
    if (!['approved', 'rejected', 'checked_in', 'checked_out'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const [result] = await connection.query(
      'UPDATE guest_registrations SET status = ?, approved_by = ? WHERE guest_id = ?',
      [status, user_id, guest_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Guest registration not found' });
    }
    
    res.json({ 
      message: `Guest registration ${status} successfully`,
      status: status
    });
    
  } catch (error) {
    console.error('Update guest status error:', error);
    res.status(500).json({ 
      error: 'Failed to update guest status',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  registerGuest,
  getGuestRegistrations,
  getGuestRegistrationById,
  updateGuestStatus
};