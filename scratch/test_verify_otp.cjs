const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2/promise');

async function testVerify() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'workontap_db',
      port: process.env.DB_PORT || 3306,
    });

    const email = 'amandeepkumar.flymediatech@gmail.com';
    const otp = '519609';

    const [rows] = await connection.execute(
      `SELECT id FROM service_providers 
       WHERE LOWER(TRIM(email)) = ? 
       AND CAST(reset_token AS CHAR) = ? 
       AND (reset_token_expiry IS NULL OR reset_token_expiry > NOW())`,
      [email, otp]
    );

    console.log('=== VERIFY TEST RESULT ===');
    console.log('Rows found:', rows.length);
    console.log(rows);

    await connection.end();
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

testVerify();
