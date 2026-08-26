import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const data = JSON.parse(fs.readFileSync('./generated_services2.json', 'utf8'));

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
  console.log('Importing from generated_services2.json safely (No Truncation)...');

  const baseServicesMap = new Map(); // slug -> insertId
  
  for (const item of data) {
    const match = item.name.match(/ in (.+)$/);
    const locationName = match ? match[1] : 'Vancouver';
    
    const baseName = item.name.replace(/ in .+$/, '');
    const baseSlug = item.slug.replace(/-in-.+$/, '');
    
    // 1. Handle base category
    const [catExists] = await pool.query('SELECT id FROM service_categories WHERE slug = ?', [item.category_slug]);
    let categoryId;
    if (catExists.length === 0) {
      const [res] = await pool.query(
        'INSERT INTO service_categories (name, slug, icon, is_active) VALUES (?, ?, ?, 1)',
        [item.category_name, item.category_slug, item.category_icon || '']
      );
      categoryId = res.insertId;
    } else {
      categoryId = catExists[0].id;
    }

    // 2. Handle base service
    let serviceId;
    const [serviceExists] = await pool.query('SELECT id FROM services WHERE slug = ?', [baseSlug]);
    
    if (serviceExists.length === 0) {
      const [res] = await pool.query(
        `INSERT INTO services (category_id, name, slug, description, short_description, base_price, additional_price, duration_minutes, image_url, use_cases, is_homepage, is_trending, is_popular, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          categoryId, 
          baseName, 
          baseSlug, 
          item.description.replace(new RegExp(' in ' + locationName, 'gi'), ''),
          item.short_description.replace(new RegExp(' in ' + locationName, 'gi'), ''),
          0, // Use 0 for price as requested earlier
          null, 
          null, 
          item.image_url, 
          item.use_cases ? item.use_cases.replace(new RegExp(' in ' + locationName, 'gi'), '') : null, 
          item.is_homepage, 
          item.is_trending, 
          item.is_popular, 
          item.is_active
        ]
      );
      serviceId = res.insertId;
    } else {
      serviceId = serviceExists[0].id;
    }
    
    // 3. Handle service_locations
    const locationSlug = locationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    await pool.query(
      `INSERT IGNORE INTO service_locations (service_id, location_name, location_slug, slug, meta_title, meta_description, keywords, canonical_url, custom_heading, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceId,
        locationName,
        locationSlug,
        item.slug,
        item.seo_meta_title,
        item.seo_meta_description,
        item.seo_keywords,
        item.seo_canonical_url,
        `#1 Rated ${baseName} in ${locationName}`,
        item.is_active
      ]
    );
  }
  
  console.log('Import completed. Added base services and locations safely.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
