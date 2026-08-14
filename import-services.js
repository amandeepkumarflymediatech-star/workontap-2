import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { default: db } = await import('./src/lib/db.js');

async function importServices() {
  console.log('Reading generated_services.json...');
  const data = JSON.parse(fs.readFileSync('generated_services.json', 'utf8'));
  console.log(`Found ${data.length} services to import.`);

  // Build category map
  const categories = await db.query('SELECT id, name FROM service_categories');
  const categoryMap = {};
  for (const cat of categories) {
    categoryMap[cat.name.toLowerCase()] = cat.id;
  }

  let insertedServices = 0;
  let insertedSeo = 0;

  for (const item of data) {
    try {
      const dbCategoryId = categoryMap[item.category_name?.toLowerCase()] || item.category_id;
      // 1. Insert or Update into `services` table
      const serviceQuery = `
        INSERT INTO services (
          id, category_id, name, slug, description, short_description, 
          base_price, additional_price, duration_minutes, image_url, 
          use_cases, is_homepage, is_trending, is_popular, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          category_id=VALUES(category_id), name=VALUES(name), description=VALUES(description),
          short_description=VALUES(short_description), base_price=VALUES(base_price),
          additional_price=VALUES(additional_price), duration_minutes=VALUES(duration_minutes),
          image_url=VALUES(image_url), use_cases=VALUES(use_cases), 
          is_homepage=VALUES(is_homepage), is_trending=VALUES(is_trending), 
          is_popular=VALUES(is_popular), is_active=VALUES(is_active);
      `;
      
      await db.execute(serviceQuery, [
        item.id,
        dbCategoryId,
        item.name,
        item.slug,
        item.description || null,
        item.short_description || null,
        item.base_price || 0,
        item.additional_price || 0,
        item.duration_minutes || 60,
        item.image_url || null,
        item.use_cases || null,
        item.is_homepage || 0,
        item.is_trending || 0,
        item.is_popular || 0,
        item.is_active || 1
      ]);
      insertedServices++;

      // 2. Insert or Update into `seo_settings` table
      const pageName = `/services/${item.slug}`;
      const seoQuery = `
        INSERT INTO seo_settings (
          page_name, meta_title, meta_description, keywords, 
          canonical_url, og_title, og_description, og_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
          keywords=VALUES(keywords), canonical_url=VALUES(canonical_url),
          og_title=VALUES(og_title), og_description=VALUES(og_description),
          og_image=VALUES(og_image);
      `;
      
      await db.execute(seoQuery, [
        pageName,
        item.seo_meta_title || null,
        item.seo_meta_description || null,
        item.seo_keywords || null,
        item.seo_canonical_url || null,
        item.seo_og_title || null,
        item.seo_og_description || null,
        item.seo_og_image || null
      ]);
      insertedSeo++;
      
    } catch (err) {
      console.error(`Error inserting service ${item.slug}:`, err.message);
    }
  }

  console.log(`Import complete!`);
  console.log(`- Upserted ${insertedServices} services`);
  console.log(`- Upserted ${insertedSeo} SEO records`);
  process.exit(0);
}

importServices().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
