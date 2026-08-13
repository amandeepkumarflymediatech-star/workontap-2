import 'dotenv/config';
import mysql from 'mysql2/promise';

const LOCATIONS = [
  { name: 'Surrey', slug: 'surrey' },
  { name: 'Burnaby', slug: 'burnaby' },
  { name: 'Richmond', slug: 'richmond' },
  { name: 'Coquitlam', slug: 'coquitlam' },
  { name: 'Langley Township', slug: 'langley-township' },
  { name: 'Delta', slug: 'delta' },
  { name: 'Maple Ridge', slug: 'maple-ridge' },
  { name: 'North Vancouver District', slug: 'north-vancouver-district' },
  { name: 'New Westminster', slug: 'new-westminster' },
  { name: 'Port Coquitlam', slug: 'port-coquitlam' },
  { name: 'North Vancouver City', slug: 'north-vancouver-city' },
  { name: 'West Vancouver', slug: 'west-vancouver' },
  { name: 'Port Moody', slug: 'port-moody' },
  { name: 'Langley City', slug: 'langley-city' },
  { name: 'Pitt Meadows', slug: 'pitt-meadows' },
  { name: 'White Rock', slug: 'white-rock' },
  { name: 'Metro Vancouver', slug: 'metro-vancouver' }
];

const CATEGORIES = [
  { id: 1, name: 'Cleaning', slug: 'cleaning', icon: 'brush-outline', description: 'Professional cleaning services' },
  { id: 2, name: 'Home Repairs', slug: 'home-repairs', icon: 'water-outline', description: 'Expert home repairs & maintenance' }
];

const SERVICES = [
  {
    category_id: 1,
    name: "Airbnb Cleaning",
    slug: "airbnb-cleaning",
    short_description: "Fast and detailed turnover cleaning for Airbnb and short-term rental properties between guest stays.",
    base_price: 125.00,
    additional_price: 40.00,
    duration_minutes: 120,
    use_cases: "Airbnb cleaning, vacation rental cleaning, short-term rental cleaning, rental turnover, guest turnover cleaning, property cleaning, host cleaning",
    is_homepage: 1, is_trending: 1, is_popular: 1
  },
  {
    category_id: 1,
    name: "Carpet Cleaning",
    slug: "carpet-cleaning",
    short_description: "Professional carpet washing using hot water extraction. Removes deep-set dirt, stains, allergens, and odours.",
    base_price: 150.00,
    additional_price: 100.00,
    duration_minutes: 90,
    use_cases: "Carpet cleaning, rug cleaning, stain removal, steam cleaning",
    is_homepage: 0, is_trending: 0, is_popular: 0
  },
  {
    category_id: 1,
    name: "Commercial Cleaning",
    slug: "commercial-cleaning",
    short_description: "Reliable commercial cleaning for offices, retail spaces, businesses, and professional workplaces.",
    base_price: 150.00,
    additional_price: 50.00,
    duration_minutes: 116,
    use_cases: "office cleaning, retail cleaning, business cleaning, commercial property cleaning, workplace cleaning",
    is_homepage: 1, is_trending: 1, is_popular: 1
  },
  {
    category_id: 1,
    name: "Deep Move In/Move Out Cleaning",
    slug: "deep-move-inmove-out-cleaning",
    short_description: "A thorough top-to-bottom clean for move-ins, move-outs, or a full seasonal reset.",
    base_price: 165.00,
    additional_price: 55.00,
    duration_minutes: 180,
    use_cases: "Move out cleaning, move in cleaning, deep house clean, seasonal reset",
    is_homepage: 1, is_trending: 1, is_popular: 1
  },
  {
    category_id: 1,
    name: "Educational Institutions Cleaning",
    slug: "educational-institutions-cleaning",
    short_description: "Complete cleaning services for schools, colleges, universities, classrooms, offices, washrooms, and common areas.",
    base_price: 250.00,
    additional_price: 75.00,
    duration_minutes: 180,
    use_cases: "school cleaning, college cleaning, classroom cleaning, university cleaning, daycare cleaning",
    is_homepage: 1, is_trending: 1, is_popular: 1
  },
  {
    category_id: 1,
    name: "Medical Facilities and Hospitals Cleaning",
    slug: "medical-facilities-and-hospitals-cleaning",
    short_description: "Specialized cleaning for hospitals, clinics, medical offices, and healthcare facilities with a strong focus on hygiene.",
    base_price: 300.00,
    additional_price: 100.00,
    duration_minutes: 240,
    use_cases: "hospital cleaning, clinic cleaning, medical office cleaning, healthcare cleaning, patient area cleaning",
    is_homepage: 1, is_trending: 1, is_popular: 1
  },
  {
    category_id: 1,
    name: "Pressure Cleaning",
    slug: "pressure-cleaning",
    short_description: "Powerful pressure cleaning for driveways, patios, sidewalks, exterior walls, decks, and outdoor surfaces.",
    base_price: 125.00,
    additional_price: 50.00,
    duration_minutes: 90,
    use_cases: "driveway cleaning, patio cleaning, sidewalk cleaning, deck cleaning, exterior cleaning",
    is_homepage: 1, is_trending: 1, is_popular: 1
  },
  {
    category_id: 1,
    name: "Regular House Cleaning",
    slug: "house-cleaning",
    short_description: "Reliable recurring house cleaning — 3-hour minimum at $135, then $45/hr. Keeps your home fresh every visit.",
    base_price: 135.00,
    additional_price: 45.00,
    duration_minutes: 180,
    use_cases: "House Cleaning, Vacuuming, Mopping, Dusting, Bathroom Cleaning, Kitchen Cleaning",
    is_homepage: 1, is_trending: 1, is_popular: 1
  },
  {
    category_id: 1,
    name: "Steam Cleaning",
    slug: "steam-cleaning",
    short_description: "Deep steam cleaning for carpets, upholstery, furniture, and other suitable surfaces.",
    base_price: 150.00,
    additional_price: 50.00,
    duration_minutes: 120,
    use_cases: "carpet steam cleaning, upholstery cleaning, sofa cleaning, furniture cleaning",
    is_homepage: 1, is_trending: 1, is_popular: 1
  },
  {
    category_id: 1,
    name: "Warehouse Cleaning",
    slug: "warehouse-cleaning",
    short_description: "Professional warehouse cleaning to remove dust, dirt, debris, and buildup from floors, storage areas, aisles.",
    base_price: 250.00,
    additional_price: 75.00,
    duration_minutes: 177,
    use_cases: "warehouse cleaning, industrial cleaning, floor cleaning, storage area cleaning",
    is_homepage: 1, is_trending: 1, is_popular: 1
  },
  {
    category_id: 1,
    name: "Window Cleaning",
    slug: "window-cleaning",
    short_description: "Professional window cleaning that removes dirt, dust, fingerprints, and buildup for clean and streak-free glass.",
    base_price: 100.00,
    additional_price: 25.00,
    duration_minutes: 60,
    use_cases: "window washing, glass cleaning, residential windows, commercial windows",
    is_homepage: 1, is_trending: 0, is_popular: 1
  },
  {
    category_id: 2,
    name: "Furniture Assembly",
    slug: "furniture-assembly",
    short_description: "Expert furniture assembly for IKEA & all flat-pack brands — starting from $120 for up to 2 hours",
    base_price: 120.00,
    additional_price: 80.00,
    duration_minutes: 90,
    use_cases: "IKEA Assembly, Furniture Assembly, Flat-Pack Assembly, Bed Frame Assembly, Wardrobe Assembly",
    is_homepage: 0, is_trending: 0, is_popular: 0
  }
];

async function seedLiveServices() {
  console.log('🚀 Seeding Live WorkOnTap Services & Categories...');

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

    // 1. Insert Categories
    for (const cat of CATEGORIES) {
      await connection.query(
        `INSERT INTO service_categories (id, name, slug, icon, description, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon)`,
        [cat.id, cat.name, cat.slug, cat.icon, cat.description, cat.id]
      );
    }
    console.log('✅ Seeded Categories');

    // 2. Insert Services
    for (const serv of SERVICES) {
      await connection.query(
        `INSERT INTO services (category_id, name, slug, short_description, base_price, additional_price, duration_minutes, use_cases, is_homepage, is_trending, is_popular, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE 
           category_id = VALUES(category_id),
           name = VALUES(name),
           short_description = VALUES(short_description),
           base_price = VALUES(base_price),
           additional_price = VALUES(additional_price),
           duration_minutes = VALUES(duration_minutes),
           use_cases = VALUES(use_cases),
           is_homepage = VALUES(is_homepage),
           is_trending = VALUES(is_trending),
           is_popular = VALUES(is_popular),
           is_active = 1`,
        [
          serv.category_id,
          serv.name,
          serv.slug,
          serv.short_description,
          serv.base_price,
          serv.additional_price,
          serv.duration_minutes,
          serv.use_cases,
          serv.is_homepage,
          serv.is_trending,
          serv.is_popular
        ]
      );
    }
    console.log(`✅ Seeded ${SERVICES.length} live services into database`);

    // 3. Seed Service Locations for all services across all 17 locations
    const [allActiveServices] = await connection.query('SELECT id, name, slug FROM services WHERE is_active = 1');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workontap.com';
    let seededCount = 0;

    for (const s of allActiveServices) {
      for (const loc of LOCATIONS) {
        const comboSlug = `${s.slug}-${loc.slug}`;
        const metaTitle = `Best ${s.name} Services in ${loc.name}, BC | WorkOnTap`;
        const metaDesc = `Looking for trusted ${s.name.toLowerCase()} in ${loc.name}, BC? Book top-rated local professionals on WorkOnTap. Fast response & guaranteed quality service!`;
        const keywords = `${s.name} ${loc.name}, ${s.name} services ${loc.name} BC, book ${s.name.toLowerCase()} ${loc.name}, local pros ${loc.name}, home services ${loc.name}`;
        const canonical = `${baseUrl}/services/${s.slug}/${loc.slug}`;
        const customHeading = `#1 Rated ${s.name} Pros in ${loc.name}, BC`;
        const customIntro = `Need reliable ${s.name.toLowerCase()} services in ${loc.name}? WorkOnTap connects you with verified local background-checked specialists ready to handle your job.`;

        await connection.query(
          `INSERT INTO service_locations 
            (service_id, location_name, location_slug, slug, meta_title, meta_description, keywords, canonical_url, custom_heading, custom_intro, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
           ON DUPLICATE KEY UPDATE 
            meta_title = COALESCE(meta_title, VALUES(meta_title)),
            meta_description = COALESCE(meta_description, VALUES(meta_description)),
            keywords = COALESCE(keywords, VALUES(keywords)),
            canonical_url = COALESCE(canonical_url, VALUES(canonical_url)),
            custom_heading = COALESCE(custom_heading, VALUES(custom_heading)),
            custom_intro = COALESCE(custom_intro, VALUES(custom_intro))`,
          [
            s.id,
            loc.name,
            loc.slug,
            comboSlug,
            metaTitle,
            metaDesc,
            keywords,
            canonical,
            customHeading,
            customIntro
          ]
        );
        seededCount++;
      }
    }

    console.log(`🎉 Successfully generated ${seededCount} service location SEO records!`);
  } catch (error) {
    console.error('❌ Error seeding live services:', error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedLiveServices();
