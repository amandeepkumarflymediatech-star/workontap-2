const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  console.log('🚀 Starting Database Migration 003...');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'workontap_db',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    });

    console.log(`Connected to database: ${process.env.DB_NAME || 'workontap_db'} at ${process.env.DB_HOST || 'localhost'}`);

    // 1. Check & Add 'service_cities' column to 'service_providers'
    const [colsCities] = await connection.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE table_schema = ? AND table_name = 'service_providers' AND column_name = 'service_cities'`,
      [process.env.DB_NAME || 'workontap_db']
    );
    if (colsCities[0].count === 0) {
      console.log('➕ Adding service_cities column to service_providers...');
      await connection.query('ALTER TABLE service_providers ADD COLUMN service_cities JSON AFTER service_areas');
      console.log('✅ Added service_cities column successfully.');
    } else {
      console.log('ℹ️ service_cities column already exists on service_providers.');
    }

    // 2. Check & Add 'cluster' column to 'bookings'
    const [colsCluster] = await connection.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE table_schema = ? AND table_name = 'bookings' AND column_name = 'cluster'`,
      [process.env.DB_NAME || 'workontap_db']
    );
    if (colsCluster[0].count === 0) {
      console.log('➕ Adding cluster column to bookings...');
      await connection.query('ALTER TABLE bookings ADD COLUMN cluster VARCHAR(100) AFTER longitude');
      console.log('✅ Added cluster column successfully.');
    } else {
      console.log('ℹ️ cluster column already exists on bookings.');
    }

    // 3. Add Indexes for Query Performance
    try {
      console.log('⚡ Adding performance indexes to bookings...');
      await connection.query('ALTER TABLE bookings ADD INDEX idx_status_provider_created (status, provider_id, created_at)');
      console.log('✅ Created idx_status_provider_created index.');
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ Index idx_status_provider_created already exists.');
      } else {
        console.warn('⚠️ Warning creating index idx_status_provider_created:', e.message);
      }
    }

    try {
      await connection.query('ALTER TABLE bookings ADD INDEX idx_city_cluster (city, cluster)');
      console.log('✅ Created idx_city_cluster index.');
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️ Index idx_city_cluster already exists.');
      } else {
        console.warn('⚠️ Warning creating index idx_city_cluster:', e.message);
      }
    }

    console.log('\n🎉 Migration 003 completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
