const { query } = require('./src/lib/db');
const fs = require('fs');

async function test() {
  try {
    const s = await query('SELECT id, slug, name FROM services');
    const sl = await query('SELECT service_id, location_slug, location_name FROM service_locations');
    fs.writeFileSync('db-output.json', JSON.stringify({ services: s, locations: sl }, null, 2));
    console.log('Success!');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
test();
