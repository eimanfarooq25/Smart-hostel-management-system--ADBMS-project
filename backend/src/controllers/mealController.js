const pool = require('../config/database');
const getAllMealPlans = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { hostel_id } = req.query;
    
    let query = `
      SELECT mp.*, h.hostel_name, h.city
      FROM meal_plans mp
      JOIN hostels h ON mp.hostel_id = h.hostel_id
      WHERE 1=1
    `;
    const params = [];
    
    if (hostel_id) {
      query += ' AND mp.hostel_id = ?';
      params.push(hostel_id);
    }
    
    query += ' ORDER BY h.hostel_name, mp.price_monthly';
    
    const [mealPlans] = await connection.query(query, params);
    
    res.json({
      count: mealPlans.length,
      meal_plans: mealPlans
    });
    
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch meal plans',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

const subscribeMealPlan = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { meal_plan_id, start_date, end_date } = req.body;
    const user_id = req.user.user_id;
    const [mealPlans] = await connection.query(
      'SELECT * FROM meal_plans WHERE meal_plan_id = ?',
      [meal_plan_id]
    );
    
    if (mealPlans.length === 0) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }
    
    const mealPlan = mealPlans[0];
    const [result] = await connection.query(
      'INSERT INTO student_meal_subscriptions (user_id, hostel_id, meal_plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, mealPlan.hostel_id, meal_plan_id, start_date, end_date, 'active']
    );
    
    res.status(201).json({
      message: 'Meal plan subscription created successfully',
      subscription_id: result.insertId
    });
    
  } catch (error) {
    console.error('Subscribe meal plan error:', error);
    res.status(500).json({ 
      error: 'Failed to subscribe to meal plan',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};
const getUserSubscriptions = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const user_id = req.user.user_id;
    
    const [subscriptions] = await connection.query(
      `SELECT sms.*, mp.plan_name, mp.price_monthly, h.hostel_name
       FROM student_meal_subscriptions sms
       JOIN meal_plans mp ON sms.meal_plan_id = mp.meal_plan_id
       JOIN hostels h ON sms.hostel_id = h.hostel_id
       WHERE sms.user_id = ?
       ORDER BY sms.created_at DESC`,
      [user_id]
    );
    
    res.json({
      count: subscriptions.length,
      subscriptions: subscriptions
    });
    
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch subscriptions',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllMealPlans,
  subscribeMealPlan,
  getUserSubscriptions
};