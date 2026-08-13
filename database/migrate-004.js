import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration004() {
  console.log('🚀 Starting Database Migration 004 (seo_settings & blogs)...');
  
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

    console.log(`Connected to database: ${process.env.DB_NAME || 'workontap_db'}`);

    const sqlFilePath = path.join(__dirname, '004_create_seo_and_blogs_tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('⚡ Executing SQL statements for 004...');
    await connection.query(sql);

    console.log('🎉 Migration 004 completed successfully!');
  } catch (error) {
    console.error('❌ Migration 004 failed:', error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration004();
