const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log('Database connection failed :', err.message);
    process.exit(1);
  } else {
    console.log('Database connected');
    connection.release();
  }
});

module.exports = pool;