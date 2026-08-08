const { execute } = require('../src/lib/db');

async function check() {
  try {
    const email = 'amandeepkumar.flymediatech@gmail.com';
    const providers = await execute('SELECT id, email, reset_token, reset_token_expiry, NOW() as current_db_time FROM service_providers WHERE email = ?', [email]);
    console.log('=== SERVICE PROVIDERS ===');
    console.log(providers);

    const users = await execute('SELECT id, email, reset_token, reset_token_expiry, NOW() as current_db_time FROM users WHERE email = ?', [email]);
    console.log('=== USERS ===');
    console.log(users);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

check();
