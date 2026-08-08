const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2/promise');

async function check() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'workontap_db',
      port: process.env.DB_PORT || 3306,
    });

    const email = 'amandeepkumar.flymediatech@gmail.com';
    const [providers] = await connection.execute('SELECT id, email, reset_token, reset_token_expiry, NOW() as current_db_time FROM service_providers WHERE email = ?', [email]);
    console.log('=== SERVICE PROVIDERS ===');
    console.log(providers);

    const [users] = await connection.execute('SELECT id, email, reset_token, reset_token_expiry, NOW() as current_db_time FROM users WHERE email = ?', [email]);
    console.log('=== USERS ===');
    console.log(users);

    await connection.end();
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

check();
