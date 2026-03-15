const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

//register new user
const register = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password, full_name, phone, city } = req.body;
    const [existing] = await connection.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [roles] = await connection.query(
      'SELECT role_id FROM roles WHERE role_name = ?',
      ['student']
    );
    
    if (roles.length === 0) {
      return res.status(500).json({ 
        error: 'System error: Student role not found' 
      });
    }
    
    const roleId = roles[0].role_id;
    
    //insert new user
    const [result] = await connection.query(
      'INSERT INTO users (role_id, email, password_hash, full_name, phone, city) VALUES (?, ?, ?, ?, ?, ?)',
      [roleId, email, hashedPassword, full_name, phone, city]
    );
    
    console.log(`New user registered: ${email} (ID: ${result.insertId})`);
    
    res.status(201).json({
      message: 'User registered successfully',
      user_id: result.insertId,
      email: email
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
//login user
const login = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password } = req.body;
    const [users] = await connection.query(
      `SELECT u.user_id, u.email, u.password_hash, u.full_name, r.role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.email = ?`,
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email, 
        role: user.role_name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    console.log(`User logged in: ${email} (${user.role_name})`);
    
    res.json({
      message: 'Login successful',
      token: token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role_name
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

//get user profile
const getProfile = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.query(
      `SELECT u.user_id, u.email, u.full_name, u.phone, u.city, r.role_name,
              u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [req.user.user_id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: users[0] });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
module.exports = { register, login, getProfile };