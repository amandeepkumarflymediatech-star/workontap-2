import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const data = JSON.parse(fs.readFileSync('./services_seed.json', 'utf8'));

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
  console.log('Seeding categories and services...');

  for (const item of data) {
    // 1. Check and Insert Category
    const [catExists] = await pool.query('SELECT id FROM service_categories WHERE slug = ?', [item.category_slug]);
    let categoryId;
    
    if (catExists.length === 0) {
      const [res] = await pool.query(
        'INSERT INTO service_categories (name, slug, icon, is_active) VALUES (?, ?, ?, 1)',
        [item.category_name, item.category_slug, item.category_icon]
      );
      categoryId = res.insertId;
    } else {
      categoryId = catExists[0].id;
    }

    // 2. Check and Insert/Update Service
    const [serviceExists] = await pool.query('SELECT id FROM services WHERE slug = ?', [item.slug]);
    
    if (serviceExists.length === 0) {
      // Insert new service
      await pool.query(
        `INSERT INTO services (category_id, name, slug, description, short_description, base_price, additional_price, duration_minutes, use_cases, is_homepage, is_trending, is_popular, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          categoryId, 
          item.name, 
          item.slug, 
          item.description,
          item.short_description,
          item.base_price, 
          0, 
          item.duration_minutes, 
          item.use_cases, 
          item.is_homepage, 
          item.is_trending, 
          item.is_popular, 
          item.is_active
        ]
      );
    } else {
      // Update existing service
      await pool.query(
        `UPDATE services SET 
          category_id = ?, name = ?, description = ?, short_description = ?, base_price = ?, duration_minutes = ?, use_cases = ?, is_homepage = ?, is_trending = ?, is_popular = ? 
         WHERE slug = ?`,
        [
          categoryId, 
          item.name, 
          item.description,
          item.short_description,
          item.base_price, 
          item.duration_minutes, 
          item.use_cases, 
          item.is_homepage, 
          item.is_trending, 
          item.is_popular,
          item.slug
        ]
      );
    }
  }
  
  console.log('Successfully seeded 13 services and 3 categories!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
