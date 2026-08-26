import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const data = JSON.parse(fs.readFileSync('./generated_services12.json', 'utf8'));

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
  console.log('Cleaning tables...');
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE services');
  await pool.query('TRUNCATE TABLE service_locations');
  await pool.query('TRUNCATE TABLE seo_settings');
  console.log('Tables cleaned.');

  const baseServicesMap = new Map(); // slug -> insertId
  
  for (const item of data) {
    const match = item.name.match(/ in (.+)$/);
    const locationName = match ? match[1] : 'Vancouver';
    
    // Extract base name and slug
    const baseName = item.name.replace(/ in .+$/, '');
    const baseSlug = item.slug.replace(/-in-.+$/, '');
    
    // 1. Handle base service
    if (!baseServicesMap.has(baseSlug)) {
      
      // Ensure category exists to satisfy foreign key (or just rely on FOREIGN_KEY_CHECKS=0)
      await pool.query(
        'INSERT IGNORE INTO service_categories (id, name, slug, icon) VALUES (?, ?, ?, ?)',
        [item.category_id, item.category_name, item.category_slug, item.category_icon || '']
      );

      const [res] = await pool.query(
        `INSERT INTO services (category_id, name, slug, description, short_description, base_price, additional_price, duration_minutes, image_url, use_cases, is_homepage, is_trending, is_popular, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.category_id, 
          baseName, 
          baseSlug, 
          item.description.replace(new RegExp(' in ' + locationName, 'g'), ''),
          item.short_description.replace(new RegExp(' in ' + locationName, 'g'), ''),
          0, // User requested no pricing (base_price)
          null, // additional_price
          null, // duration_minutes
          item.image_url, 
          item.use_cases ? item.use_cases.replace(new RegExp(' in ' + locationName, 'g'), '') : null, 
          item.is_homepage, 
          item.is_trending, 
          item.is_popular, 
          item.is_active
        ]
      );
      baseServicesMap.set(baseSlug, res.insertId);
    }
    
    const serviceId = baseServicesMap.get(baseSlug);
    
    // 2. Handle service_locations
    const locationSlug = locationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    await pool.query(
      `INSERT IGNORE INTO service_locations (service_id, location_name, location_slug, slug, meta_title, meta_description, keywords, canonical_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceId,
        locationName,
        locationSlug,
        item.slug,
        item.seo_meta_title,
        item.seo_meta_description,
        item.seo_keywords,
        item.seo_canonical_url,
        item.is_active
      ]
    );
  }
  
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Import completed. Inserted base services:', baseServicesMap.size);
  console.log('Total location entries inserted:', data.length);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
