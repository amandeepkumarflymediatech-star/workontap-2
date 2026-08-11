const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Ensure it reads from project root

async function runMigration() {
  console.log('🚀 Starting Database Migration 004...');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'workontap_db',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      multipleStatements: true // Allow multiple SQL statements in one query
    });

    console.log(`Connected to database: ${process.env.DB_NAME || 'workontap_db'} at ${process.env.DB_HOST || 'localhost'}`);

    console.log('📖 Reading 004_create_seo_and_blogs_tables.sql...');
    const sqlFilePath = path.join(__dirname, '004_create_seo_and_blogs_tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('⚡ Executing SQL statements...');
    await connection.query(sql);

    console.log('\n🎉 Migration 004 completed successfully!');
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
