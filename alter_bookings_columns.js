import 'dotenv/config';
import mysql from 'mysql2/promise';

async function fixBookingsColumns() {
  console.log('🚀 Fixing bookings table schema (adding latitude, longitude, cluster, etc.)...');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_NAME || 'workontap_db',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      multipleStatements: true
    });

    console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME || 'workontap_db'}`);

    const columnsToAdd = [
      { name: 'latitude', type: 'DECIMAL(10,8) DEFAULT NULL' },
      { name: 'longitude', type: 'DECIMAL(11,8) DEFAULT NULL' },
      { name: 'cluster', type: 'VARCHAR(100) DEFAULT NULL' },
      { name: 'payment_status', type: 'VARCHAR(50) DEFAULT "authorized"' },
      { name: 'standard_duration_minutes', type: 'INT DEFAULT NULL' },
      { name: 'payment_intent_id', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'authorized_amount', type: 'DECIMAL(10,2) DEFAULT NULL' }
    ];

    for (const col of columnsToAdd) {
      try {
        const [rows] = await connection.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bookings' AND COLUMN_NAME = ?`,
          [process.env.DB_NAME || 'workontap_db', col.name]
        );

        if (rows.length === 0) {
          console.log(`➕ Adding missing column '${col.name}' to bookings table...`);
          await connection.query(`ALTER TABLE bookings ADD COLUMN ${col.name} ${col.type}`);
          console.log(`✅ Added column '${col.name}'`);
        } else {
          console.log(`✔ Column '${col.name}' already exists`);
        }
      } catch (err) {
        console.error(`Error checking/adding column '${col.name}':`, err.message);
      }
    }

    console.log('🎉 Bookings schema check/fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing bookings table:', error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixBookingsColumns();
