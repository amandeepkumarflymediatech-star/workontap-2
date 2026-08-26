import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const CANADIAN_CITIES = [
  'Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Coquitlam', 
  'Langley Township', 'Delta', 'Maple Ridge', 'New Westminster', 
  'Port Coquitlam', 'North Vancouver', 'West Vancouver', 
  'Port Moody', 'Langley City', 'Pitt Meadows', 'White Rock', 'Metro Vancouver'
];

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'workontap_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function run() {
  console.log('Generating locations for all services...');
  
  const [services] = await pool.query('SELECT id, name, slug FROM services WHERE is_active = 1');
  
  for (const service of services) {
    for (const city of CANADIAN_CITIES) {
      const locationSlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const fullSlug = `${service.slug}-in-${locationSlug}`;
      
      const metaTitle = `Best ${service.name} in ${city}, BC | WorkOnTap`;
      const metaDesc = `Looking for trusted ${service.name.toLowerCase()} in ${city}, BC? Book top-rated local pros on WorkOnTap.`;
      const heading = `#1 Rated ${service.name} Pros in ${city}, BC`;
      
      await pool.query(
        `INSERT IGNORE INTO service_locations (service_id, location_name, location_slug, slug, meta_title, meta_description, custom_heading, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [service.id, city, locationSlug, fullSlug, metaTitle, metaDesc, heading]
      );
    }
  }
  
  console.log('Successfully generated locations!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
