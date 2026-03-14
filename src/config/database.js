const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✓ Database connected successfully');
    console.log(`  Database: ${process.env.DB_NAME}`);
    console.log(`  Connection pool: 10 connections`);
    connection.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    console.error('  Check your .env file credentials');
  });

module.exports = pool;